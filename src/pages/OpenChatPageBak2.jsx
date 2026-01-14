import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ImageIcon, Loader2, ArrowDown, SendHorizonal } from 'lucide-react';
import SketchHeader from '@components/SketchHeader';

import { useMsg } from '@contexts/MsgContext';
import { useAuth } from '../contexts/AuthContext';
import '@components/SketchComponents.css';
import ApiClient from '@utils/ApiClient';
import ChatStorage from '@utils/ChatStorage';
import Swal from 'sweetalert2';

const RETENTION_DAYS = 7;

const USER_LEVEL_ICONS = {
    1: "/cdn/lvl1.png",
    2: "/cdn/lvl2.png",
    3: "/cdn/lvl3.png",
    4: "/cdn/lvl4.png",
    5: "/cdn/lvl5.png",
    98: "/cdn/lvl98.png",
    99: "/cdn/lvl99.png"
};

// --- Sub Components ---

const FloatBottomButton = React.memo(({ isVisible, onClick }) => {
    if (!isVisible) return null;
    return (
        <button className="float-bottom-btn" onClick={onClick} aria-label="맨 아래로">
            <ArrowDown size={20} color="#555" />
        </button>
    );
});

const ChatInput = React.memo(({ onSend, placeholder, onRef }) => {
    const inputRef = useRef(null);

    const handleSend = useCallback(() => {
        const val = inputRef.current?.value?.trim();
        if (!val) return;
        onSend(val);
        if (inputRef.current) inputRef.current.value = '';
    }, [onSend]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    useEffect(() => {
        if (onRef) onRef({ handleSend, inputRef });
    }, [onRef, handleSend]);

    return (
        <div className="input-inner-container">
            <input
                ref={inputRef}
                className="chat-input-field"
                type="text"
                placeholder={placeholder}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
});

// --- Main Component ---

const OpenChatPage = ({ navigateToPageWithData, PAGES, goBack, refreshUnreadCounts, ...otherProps }) => {
    const { get, currentLang } = useMsg();
    const { user } = useAuth();

    const [room_sn, setRoomSn] = useState(1);
    const [roomTitle, setRoomTitle] = useState('');
    const [chat_messages, setChatMessages] = useState([]);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [hasMoreOlder, setHasMoreOlder] = useState(true);
    const [showFloatButton, setShowFloatButton] = useState(false);
    const [translationMap, setTranslationMap] = useState({});
    const [modalImage, setModalImage] = useState(null);

    const intervalRef = useRef(null);
    const lastChatSnRef = useRef(null);
    const firstChatSnRef = useRef(null); // 과거 데이터 로딩용 기준점
    const chatBoxRef = useRef(null);
    const chatInputRef = useRef(null);
    const isScrollingRef = useRef(false);
    const isLoadingRef = useRef(false);
    const scrollTimeoutRef = useRef(null);

    useEffect(() => {
        const initDB = async () => {
            try {
                await ChatStorage.init();
                await ChatStorage.cleanupOldMessages(RETENTION_DAYS);
            } catch (e) { console.error('DB Init Error:', e); }
        };
        initDB();
        setRoomTitle(get('open_chat_label') || '오픈채팅');
    }, [get]);

    const formatTime = useCallback((date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            hour: '2-digit', minute: '2-digit', hour12: false,
        }).format(date);
    }, []);

    const scrollToBottom = useCallback((behavior = 'smooth', force = false) => {
        if (!force && isScrollingRef.current) return;
        if (!chatBoxRef.current) return;

        isScrollingRef.current = true;
        const { scrollHeight, clientHeight } = chatBoxRef.current;
        chatBoxRef.current.scrollTo({ top: scrollHeight - clientHeight, behavior });

        setTimeout(() => {
            isScrollingRef.current = false;
            setShowFloatButton(false);
        }, behavior === 'auto' ? 50 : 500);
    }, []);

    // 데이터 패칭 로직 최적화 (의존성 최소화)
    const getChattingData = useCallback(async (isInitial = false, loadOlder = false) => {
        if (isLoadingRef.current || !room_sn) return;
        isLoadingRef.current = true;
        if (loadOlder) setIsLoadingOlder(true);

        try {
            const limit = 20;
            let messagesToDisplay = [];

            if (loadOlder) {
                // [Scenario A: Loading Old Data]
                // 1. Load from DB older than current view's first msg
                // 2. If DB has enough, show them.
                // 3. If DB has gap, fetch API.
                const oldestSn = firstChatSnRef.current;
                let dbMsgs = await ChatStorage.getMessages(limit, oldestSn);

                if (dbMsgs.length < limit) {
                    const lastSn = dbMsgs.length > 0 ? dbMsgs[dbMsgs.length - 1].chat_sn : oldestSn;
                    // Fetch gap from API
                    const response = await ApiClient.get('/api/openchat/messages', {
                        params: { room_sn, limit: limit - dbMsgs.length, direction: 'older', before_chat_sn: lastSn }
                    });

                    if (response.data?.length > 0) {
                        // SAVE TO DB
                        await ChatStorage.saveMessages(response.data);
                        messagesToDisplay = [...dbMsgs, ...response.data];
                    } else {
                        messagesToDisplay = dbMsgs;
                        setHasMoreOlder(false);
                    }
                } else {
                    messagesToDisplay = dbMsgs;
                }

            } else {
                // [Scenario B: Initial Load / Polling]

                if (isInitial) {
                    // 1. DB FIRST: Load latest messages from DB immediately
                    const dbMsgs = await ChatStorage.getMessages(limit, null); // null means latest

                    if (dbMsgs.length > 0) {
                        // Display DB data first
                        const transformed = dbMsgs.map(item => ({
                            id: item.chat_sn,
                            chat_sn: item.chat_sn,
                            sender: String(item.sender_id) === String(user.user_id) ? 'me' : 'other',
                            text: item.message || item.chat_msg || '',
                            image: item.image_url,
                            video: item.video_url,
                            time: formatTime(new Date(item.created_at || item.send_dt)),
                            sender_name: item.sender_name,
                            sender_level: item.sender_level,
                            sender_color: item.sender_color,
                            rank_name: item['msg_' + (currentLang || 'kr')] || item.msg_kr || '',
                        }));
                        const sorted = transformed.reverse();
                        setChatMessages(sorted);
                        if (sorted.length > 0) {
                            firstChatSnRef.current = sorted[0].chat_sn;
                            lastChatSnRef.current = sorted[sorted.length - 1].chat_sn;
                        }
                        // Scroll to bottom immediately for cache
                        setTimeout(() => scrollToBottom('auto', true), 0);
                    }
                }

                // 2. THEN SYNC: Fetch newer messages from API
                const lastSn = lastChatSnRef.current || 0;
                const response = await ApiClient.get('/api/openchat/messages', {
                    params: { room_sn, limit, direction: 'newer', last_chat_sn: lastSn }
                });

                if (response.data?.length > 0) {
                    // SAVE TO DB
                    await ChatStorage.saveMessages(response.data);
                    messagesToDisplay = response.data;
                }
            }

            if (messagesToDisplay.length === 0) return;

            // Transform raw data to UI format
            const transformed = messagesToDisplay.map(item => ({
                id: item.chat_sn,
                chat_sn: item.chat_sn,
                sender: String(item.sender_id) === String(user.user_id) ? 'me' : 'other',
                text: item.message || item.chat_msg || '',
                image: item.image_url,
                video: item.video_url,
                time: formatTime(new Date(item.created_at || item.send_dt)),
                sender_name: item.sender_name,
                sender_level: item.sender_level,
                sender_color: item.sender_color,
                rank_name: item['msg_' + (currentLang || 'kr')] || item.msg_kr || '',
            }));

            if (loadOlder) {
                const container = chatBoxRef.current;
                const prevScrollHeight = container.scrollHeight;

                setChatMessages(prev => {
                    const ids = new Set(prev.map(m => m.chat_sn));
                    const filtered = transformed.filter(m => !ids.has(m.chat_sn));
                    const newList = [...filtered.reverse(), ...prev];
                    if (newList.length > 0) firstChatSnRef.current = newList[0].chat_sn;
                    return newList;
                });

                setTimeout(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight - prevScrollHeight;
                    }
                }, 0);
            } else {
                // New messages (Initial sync or Polling)
                setChatMessages(prev => {
                    const ids = new Set(prev.map(m => m.chat_sn));
                    const filtered = transformed.filter(m => !ids.has(m.chat_sn)).sort((a, b) => a.chat_sn - b.chat_sn);
                    if (filtered.length === 0) return prev;

                    const newList = [...prev, ...filtered];
                    lastChatSnRef.current = newList[newList.length - 1].chat_sn;
                    return newList;
                });

                // If it's not initial load (polling), and we found new messages
                // Do NOT auto-scroll, but show the button to let user know
                if (!isInitial && messagesToDisplay.length > 0) {
                    setShowFloatButton(true);
                } else if (messagesToDisplay.length > 0) {
                    // Initial sync (although usually covered by DB load logic, if DB was empty but API had data)
                    scrollToBottom('smooth');
                }
            }
        } catch (e) { console.error('GetChatting Error', e); }
        finally {
            isLoadingRef.current = false;
            setIsLoadingOlder(false);

            // Refresh unread counts (clear badge) after fetching/saving
            if (refreshUnreadCounts) {
                refreshUnreadCounts();
            }
        }
    }, [room_sn, user.user_id, formatTime, currentLang, scrollToBottom, refreshUnreadCounts]);

    useEffect(() => {
        getChattingData(true);
        intervalRef.current = setInterval(() => getChattingData(), 3000);
        return () => clearInterval(intervalRef.current);
    }, [room_sn, getChattingData]);

    const handleScroll = useCallback(() => {
        if (!chatBoxRef.current || isLoadingRef.current) return;
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

        scrollTimeoutRef.current = setTimeout(() => {
            const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
            const dist = scrollHeight - scrollTop - clientHeight;

            setShowFloatButton(dist > 300);

            // 맨 위 도달 시 과거 데이터 로드
            if (!isLoadingOlder && hasMoreOlder && scrollTop < 100) {
                getChattingData(false, true);
            }
        }, 150);
    }, [isLoadingOlder, hasMoreOlder, getChattingData]);

    useEffect(() => {
        const el = chatBoxRef.current;
        el?.addEventListener('scroll', handleScroll);
        return () => el?.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const handleTranslate = async (chatSn, text) => {
        try {
            const apiKey = 'AIzaSyDCt8lNfZ8_91dDbsVHhUvYTPXpEIEM-yM';
            const target = currentLang === 'kr' ? 'ko' : currentLang === 'cn' ? 'zh' : currentLang || 'ko';
            const res = await ApiClient.post(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
                q: text, target, format: 'text'
            });
            setTranslationMap(prev => ({ ...prev, [chatSn]: res.data.translations[0].translatedText }));
        } catch (e) {
            // Swal.fire('Error', '번역 실패', 'error'); 
        }
    };

    const handleMessageSend = async (message) => {
        const tempId = Date.now();
        const now = new Date();
        const uiMsg = {
            id: tempId,
            chat_sn: tempId,
            sender: 'me',
            text: message,
            time: formatTime(now),
            sender_name: user.name || 'Me',
            sender_level: user.level,
            sender_color: user.color // Assuming user object might have this, or fallback
        };

        setChatMessages(prev => [...prev, uiMsg]);
        setTimeout(() => scrollToBottom('auto', true), 0);

        try {
            // User Request: Fix API call (Text should be JSON usually, but check if postForm was intended.
            // Previous working code used `ApiClient.post` for text.
            const payload = {
                room_sn,
                sender_id: user.user_id,
                chat_msg: message,
                type: 'text'
            };
            const response = await ApiClient.postForm('/api/openchat/message', payload);
            const realChatSn = response.data?.chat_sn;

            if (realChatSn) {
                // SAVE TO DB
                const confirmedData = {
                    chat_sn: realChatSn,
                    sender_id: user.user_id,
                    message: message,
                    type: 'text',
                    created_at: now.toISOString(),
                    send_dt: now.toISOString(),
                    sender_name: user.name,
                    sender_level: user.level,
                    room_sn: room_sn
                };
                await ChatStorage.saveMessages([confirmedData]);

                // Reconcile: Update the optimistic message with real chat_sn
                setChatMessages(prev => prev.map(m => {
                    if (m.id === tempId) {
                        return { ...m, chat_sn: realChatSn };
                    }
                    return m;
                }));
            } else {
                // If API call was successful but no chat_sn returned, remove optimistic message
                setChatMessages(prev => prev.filter(m => m.id !== tempId));
            }
        } catch (e) {
            console.error('Message Send Failed:', e);
            // Optionally mark error or remove
            setChatMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    const handleDeleteMessage = useCallback(async (chat_sn) => {
        try {
            const result = await Swal.fire({
                title: '삭제하시겠습니까?',
                text: "선택한 메시지를 삭제합니다.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: '삭제',
                cancelButtonText: '취소'
            });

            if (result.isConfirmed) {
                const payload = {
                    user_id: user.user_id,
                    chat_sn: chat_sn,
                };
                await ApiClient.postForm('/api/openchat/delete', payload);
                await ChatStorage.deleteMessage(chat_sn);
                setChatMessages(prev => prev.filter(msg => msg.chat_sn !== chat_sn));

                Swal.fire('삭제됨', '메시지가 삭제되었습니다.', 'success');
            }
        } catch (e) {
            console.error(e);
            Swal.fire('오류', '삭제에 실패했습니다.', 'error');
        }
    }, [user.user_id]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = ''; // Reset input

        const tempId = Date.now();
        const now = new Date();
        const previewUrl = URL.createObjectURL(file);
        const fileType = file.type.startsWith('video/') ? 'video' : 'image';

        const uiMsg = {
            id: tempId,
            chat_sn: tempId,
            sender: 'me',
            text: '',
            image: fileType === 'image' ? previewUrl : null,
            video: fileType === 'video' ? previewUrl : null,
            time: formatTime(now),
            sender_name: user.name || 'Me',
            sender_level: user.level,
            isUploading: true
        };

        setChatMessages(prev => [...prev, uiMsg]);
        scrollToBottom('auto', true);
        isLoadingRef.current = true; // Temporary lock

        try {
            const formData = new FormData();
            formData.append('room_sn', room_sn);
            formData.append('user_id', user.user_id);
            formData.append('sender_id', user.user_id);
            formData.append('chat_msg', '');
            formData.append('type', fileType);
            formData.append('file', file);

            console.log('📤 Uploading file...', file.name);

            const res = await ApiClient.post('/api/openchat/message', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data && res.data.chat_sn) {
                const realChatSn = res.data.chat_sn;
                const realUrl = res.data.image_url || res.data.video_url || previewUrl;
                const created_at = res.data.created_at || now.toISOString();

                lastChatSnRef.current = realChatSn;

                // RECONCILE & SAVE TO DB
                const confirmedData = {
                    chat_sn: realChatSn,
                    sender_id: user.user_id,
                    message: '',
                    image_url: fileType === 'image' ? realUrl : null,
                    video_url: fileType === 'video' ? realUrl : null,
                    type: fileType,
                    created_at: created_at,
                    send_dt: created_at,
                    sender_name: user.name,
                    sender_level: user.level,
                    room_sn: room_sn
                };
                await ChatStorage.saveMessages([confirmedData]);

                setChatMessages(prev => prev.map(m => {
                    if (m.id === tempId) {
                        return {
                            ...m,
                            chat_sn: realChatSn,
                            image: fileType === 'image' ? realUrl : null,
                            video: fileType === 'video' ? realUrl : null,
                            isUploading: false
                        };
                    }
                    return m;
                }));
            } else {
                setChatMessages(prev => prev.filter(m => m.id !== tempId));
            }
        } catch (e) {
            console.error('Upload Failed:', e);
            setChatMessages(prev => prev.filter(m => m.id !== tempId));
            Swal.fire('오류', '파일 업로드에 실패했습니다.', 'error');
        } finally {
            isLoadingRef.current = false;
        }
    };

    // --- Message Render ---
    const ChatMessage = React.memo(({ msg, setModalImage, translation, onTranslate, onDelete }) => {
        const isMine = msg.sender === 'me';
        const hasText = !!msg.text && !msg.text.includes('<img') && !msg.text.includes('<video');
        const hasMedia = !!msg.image || (msg.text && (msg.text.includes('<img') || msg.text.includes('<video')));
        const isImageOnly = hasMedia && !hasText;

        // Long press handling
        const timerRef = useRef(null);

        const handleTouchStart = () => {
            if (!isMine) return;
            timerRef.current = setTimeout(() => {
                onDelete(msg.chat_sn);
            }, 800); // 800ms long press
        };

        const handleTouchEnd = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };

        return (
            <div className={`message-row ${msg.sender}`}>
                {!isMine && (
                    <div className="profile-wrapper">
                        <img src={USER_LEVEL_ICONS[msg.sender_level] || USER_LEVEL_ICONS[1]} alt="lv" className="lv-icon" />
                    </div>
                )}
                <div className="bubble-container">
                    {!isMine && (
                        <div className="sender-info">
                            <span className="rank" style={{ color: msg.sender_color, fontWeight: 'bold' }}> {msg.sender_level < 10 ? `Lv.${msg.sender_level} ` : '🤠'}{msg.rank_name}</span>
                            <span className="name" style={{ color: '#868e96' }}>{msg.sender_name}</span>
                        </div>
                    )}
                    <div className="bubble-wrapper">
                        <div
                            className={`bubble ${isImageOnly ? 'bubble-image-only' : ''}`}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            onMouseDown={handleTouchStart}
                            onMouseUp={handleTouchEnd}
                            onMouseLeave={handleTouchEnd}
                        >
                            {msg.text && (
                                (msg.text.includes('<img') || msg.text.includes('<video')) ? (
                                    <div
                                        className="html-content"
                                        dangerouslySetInnerHTML={{ __html: msg.text }}
                                        onClick={(e) => {
                                            if (e.target.tagName === 'IMG') setModalImage(e.target.src);
                                        }}
                                    />
                                ) : (
                                    <div>{msg.text}</div>
                                )
                            )}
                            {msg.image && <img src={msg.image} className="chat-img" onClick={() => setModalImage(msg.image)} alt="chat" />}
                            {translation && <div className="translated-text">{translation} <span>(번역됨)</span></div>}
                            {!isMine && !translation && hasText && (
                                <button className="trans-btn-inline" onClick={() => onTranslate(msg.chat_sn, msg.text)}>번역</button>
                            )}

                            {/* Uploading Overlay */}
                            {msg.isUploading && (
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 'inherit', zIndex: 10, color: 'white', fontSize: '12px', fontWeight: 'bold'
                                }}>
                                    업로드 중...
                                </div>
                            )}
                        </div>
                        <span className="time">{msg.time}</span>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <>
            <style jsx="true">{`
                .chat-container {
                    display: flex;
                    flex-direction: column;
                    height: calc(100dvh - 140px - var(--safe-bottom, 0px));
                    background: #ffffff; /* 흰색 배경 */
                    overflow: hidden;
                    position: relative;
                }

                .top-loader {
                    display: flex;
                    justify-content: center;
                    padding: 15px 0;
                    width: 100%;
                }
                .spinner { animation: spin 1s linear infinite; color: #adb5bd; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    scroll-behavior: auto !important; /* 수동 제어를 위해 auto */
                }

                .message-row { display: flex; margin-bottom: 8px; max-width: 85%; }
                .message-row.me { align-self: flex-end; flex-direction: row-reverse; }
                
                .profile-wrapper {
                    width: 36px;
                    height: 36px;
                    margin-right: 8px;
                    flex-shrink: 0;
                    
                    /* 둥근 사각형을 위한 핵심 속성 */
                    border-radius: 8px; /* 숫자가 커질수록 더 둥글어집니다 */
                    border: solid 0.3px #8e8e8e;
                    overflow: hidden;    /* 내부 이미지가 영역을 벗어나지 않게 잘라줌 */
                    background-color: #eee; /* 이미지 로딩 전 배경색 (선택사항) */
                    }

                    /* 내부 이미지가 있다면 가득 채우도록 설정 */
                    .profile-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    }
                .lv-icon { width: 100%; height: 100%; object-fit: contain; }

                .bubble-container { display: flex; flex-direction: column; }
                .sender-info { margin-bottom: 2px; font-size: 11px; display: flex; gap: 4px; align-items: center; }
                .sender-info .rank { color: #868e96; }
                .sender-info .name { font-weight: 3.00; }

                .bubble-wrapper { display: flex; align-items: flex-end; gap: 6px; }
                .me .bubble-wrapper { flex-direction: row-reverse; }

                .bubble {
                    padding: 10px 14px;
                    font-size: 14.5px;
                    line-height: 1.4;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    word-break: break-word;
                    position: relative;
                }
                
                .bubble.bubble-image-only {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                }

                .other .bubble { 
                    background: #f1f3f5; 
                    color: #212529; 
                    border-radius: 2px 16px 16px 16px; 
                    border: 1px solid #e9ecef;
                }
                .me .bubble { 
                    background: #4dabf7; 
                    color: #fff; 
                    border-radius: 16px 2px 16px 16px; 
                }

                .time { font-size: 10px; color: #adb5bd; flex-shrink: 0; margin-bottom: 2px; }
                .chat-img, .html-content img { max-width: 220px; border-radius: 12px; display: block; cursor: pointer; }
                
                .trans-btn-inline { background: none; border: none; color: #4dabf7; font-size: 11px; cursor: pointer; padding: 4px 0 0 0; display: block; }
                .me .trans-btn-inline { color: #e7f5ff; }

                .translated-text { margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(0,0,0,0.05); font-style: italic; font-size: 13px; opacity: 0.9; }

                .chat-input-wrapper {
                    position: fixed;
                    bottom: calc(92px + var(--safe-bottom, 0px));
                    left: 0; right: 0;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    border-top: 1px solid #e9ecef;
                    z-index: 100;
                    gap: 8px;
                }
                .input-inner-container { flex: 1; background: #f1f3f5; border-radius: 20px; padding: 4px 12px; }
                .chat-input-field { width: 100%; border: none; background: none; padding: 6px 0; font-size: 15px; outline: none; }
                .icon-btn { background: none; border: none; padding: 4px; cursor: pointer; color: #495057; display: flex; align-items: center; }
                .send-btn-active { color: #4dabf7; }

                .float-bottom-btn {
                    position: fixed; right: 16px; bottom: 160px;
                    width: 40px; height: 40px; border-radius: 50%;
                    background: #fff; border: 1px solid #dee2e6;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    display: flex; align-items: center; justify-content: center; z-index: 90;
                }

                .image-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .image-modal img { max-width: 95%; max-height: 95%; object-fit: contain; }
            `}</style>

            <div className="chat-container">
                <SketchHeader title={roomTitle} showBack={true} onBack={goBack} />

                <div className="chat-messages" ref={chatBoxRef}>
                    {isLoadingOlder && (
                        <div className="top-loader">
                            <Loader2 className="spinner" size={24} />
                        </div>
                    )}

                    {chat_messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            msg={msg}
                            setModalImage={setModalImage}
                            translation={translationMap[msg.chat_sn]}
                            onTranslate={handleTranslate}
                            onDelete={handleDeleteMessage}
                        />
                    ))}
                </div>

                <FloatBottomButton isVisible={showFloatButton} onClick={() => scrollToBottom('smooth')} />
            </div>

            <div className="chat-input-wrapper">
                <button className="icon-btn" onClick={() => document.getElementById('media-upload-input').click()}>
                    <ImageIcon size={24} />
                </button>
                <input id="media-upload-input" type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileSelect} />

                <ChatInput
                    onSend={handleMessageSend}
                    placeholder="메시지를 입력하세요..."
                    onRef={(ref) => chatInputRef.current = ref}
                />

                <button className="icon-btn send-btn-active" onClick={() => chatInputRef.current?.handleSend()}>
                    <SendHorizonal size={24} />
                </button>
            </div>

            {modalImage && (
                <div className="image-modal" onClick={() => setModalImage(null)}>
                    <img src={modalImage} alt="zoom" />
                </div>
            )}
        </>
    );
};

export default OpenChatPage;