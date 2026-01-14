import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { ImageIcon, Loader2, ArrowDown, SendHorizonal, Menu } from 'lucide-react';
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

const ChatInput = React.memo(({ onFocus, onBlur, onClick, onSend, placeholder, onRef }) => {
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
                onFocus={onFocus}
                onBlur={onBlur}
                onClick={onClick}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
});

const UserListDrawer = React.memo(({ show, onClose, users, currentLang, currentUser }) => {
    // Prevent background scroll when open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        }
    }, [show]);

    // Group users by level/rank
    const groupedUsers = React.useMemo(() => {
        const groups = {};
        users.forEach(u => {
            const lvl = u.user_lvl || 1;
            if (!groups[lvl]) {
                groups[lvl] = {
                    level: lvl,
                    name: u['msg_' + (currentLang || 'kr')] || u.msg_kr || 'Member',
                    color: u.code_color || '#333',
                    users: []
                };
            }
            groups[lvl].users.push(u);
        });

        // Process each group: Sort by nickname, then move Me to top
        Object.values(groups).forEach(group => {
            group.users.sort((a, b) => {
                const nameA = a.nickname || '';
                const nameB = b.nickname || '';

                // Check for Me (Assuming nickname match or user_id if available)
                const isMeA = (currentUser && (a.nickname === currentUser.name || a.nickname === currentUser.nickname));
                const isMeB = (currentUser && (b.nickname === currentUser.name || b.nickname === currentUser.nickname));

                if (isMeA && !isMeB) return -1;
                if (!isMeA && isMeB) return 1;

                return nameA.localeCompare(nameB);
            });
        });

        // Sort groups by level descending
        return Object.values(groups).sort((a, b) => b.level - a.level);
    }, [users, currentLang, currentUser]);

    return (
        <>
            <div className={`drawer-overlay ${show ? 'show' : ''}`} onClick={onClose} />
            <div className={`drawer-content ${show ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h3>접속자 목록 <span className="count">({users.length})</span></h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="user-list">
                    {groupedUsers.map(group => (
                        <div key={group.level} className="user-group">
                            <div className="group-header" style={{ color: group.color }}>
                                <div className="header-icon-wrapper">
                                    <img src={USER_LEVEL_ICONS[group.level] || USER_LEVEL_ICONS[1]} alt="lv" />
                                </div>
                                <span className="group-name">{`${group.level > 10 ? `🤠 ` : `Lv. ${group.level}`} ` + group.name} — {group.users.length}</span>
                            </div>
                            <div className="group-items">
                                {group.users.map((u, i) => {
                                    const isMe = (currentUser && (u.nickname === currentUser.name || u.nickname === currentUser.nickname));
                                    return (
                                        <div className="user-item-simple" key={u.nickname + i}>
                                            <div className="status-dot" style={{ backgroundColor: group.color }}></div>
                                            <span className="nickname">{u.nickname}</span>
                                            {isMe && <span className="me-badge">(me)</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx="true">{`
                .drawer-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
                    opacity: 0; pointer-events: none; transition: opacity 0.3s; z-index: 1000;
                }
                .drawer-overlay.show { opacity: 1; pointer-events: auto; }

                .drawer-content {
                    position: fixed; top: 0; right: -280px; bottom: 0; width: 280px;
                    background: #fff; box-shadow: -2px 0 8px rgba(0,0,0,0.1);
                    z-index: 1001; transition: right 0.3s ease-out;
                    display: flex; flex-direction: column;
                }
                .drawer-content.open { right: 0; }

                .drawer-header {
                    padding: 16px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;
                }
                .drawer-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
                .drawer-header .count { color: #868e96; font-size: 14px; font-weight: 400; }
                .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #333; }

                .user-list { flex: 1; overflow-y: auto; padding: 10px; }

                .user-group { margin-bottom: 20px; }
                .group-header { 
                    display: flex; align-items: center; 
                    font-size: 13px; font-weight: bold; 
                    text-transform: uppercase; margin-bottom: 8px; 
                    padding: 0 8px; opacity: 0.9;
                }
                .header-icon-wrapper { width: 16px; height: 16px; margin-right: 6px; }
                .header-icon-wrapper img { width: 100%; height: 100%; object-fit: contain; }

                .user-item-simple { 
                    display: flex; align-items: center; padding: 6px 12px; 
                    border-radius: 4px; color: #495057; font-size: 15px; 
                    /* hover effect optional */
                }
                .user-item-simple:hover { background: #f8f9fa; }
                
                .status-dot {
                    width: 6px; height: 6px; border-radius: 50%; margin-right: 10px; opacity: 0.5;
                }
                .nickname { font-weight: 500; }
                .me-badge {
                    font-size: 11px; color: #adb5bd; margin-left: 6px; font-weight: normal;
                }
            `}</style>
        </>
    );
});


let initialScrollY = 0;


// --- Main Component ---

const OpenChatPage = ({ navigateToPage, navigateToPageWithData, PAGES, goBack, refreshUnreadCounts, ...otherProps }) => {

    const textareaRef = useRef < HTMLTextAreaElement > (null);
    const [isFocus, setIsFocus] = useState(false);


    const { get, currentLang } = useMsg();
    const { user } = useAuth();

    const [room_sn, setRoomSn] = useState(1);
    const [roomTitle, setRoomTitle] = useState('');
    const [chat_messages, setChatMessages] = useState([]);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [hasMoreOlder, setHasMoreOlder] = useState(true);
    const [initScroll, setInitScroll] = useState(false);
    const [showFloatButton, setShowFloatButton] = useState(false);
    const [translationMap, setTranslationMap] = useState({});
    const [modalImage, setModalImage] = useState(null);
    const [showUserList, setShowUserList] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const intervalRef = useRef(null);
    const lastChatSnRef = useRef(null);
    const firstChatSnRef = useRef(null); // 과거 데이터 로딩용 기준점
    const chatBoxRef = useRef(null);
    const chatInputRef = useRef(null);
    const isScrollingRef = useRef(false);
    const isLoadingRef = useRef(false);
    const scrollTimeoutRef = useRef(null);


    // 키보드 밀림현상
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (isFocus) {
                if (!initialScrollY) {
                    initialScrollY = currentScrollY;
                }

                if (currentScrollY > initialScrollY) {
                    window.scrollTo(0, initialScrollY);
                }
            } else {
                initialScrollY = 0;
            }
        };

        window.visualViewport?.addEventListener('resize', handleScroll);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.visualViewport?.removeEventListener('resize', handleScroll);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isFocus]);




    useEffect(() => {
        const initDB = async () => {
            try {
                await ChatStorage.init();

                // await ChatStorage.deleteAllMessages();

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

    const scrollStateRef = useRef({ isRestoring: false, prevHeight: 0 });

    useLayoutEffect(() => {
        if (scrollStateRef.current.isRestoring && chatBoxRef.current) {
            const container = chatBoxRef.current;
            const currentHeight = container.scrollHeight;
            const prevHeight = scrollStateRef.current.prevHeight;

            // Restore scroll position
            container.scrollTop = currentHeight - prevHeight;
            scrollStateRef.current.isRestoring = false;
        }
    }, [chat_messages]);

    // 데이터 패칭 로직 최적화 (의존성 최소화)
    const getChattingData = useCallback(async (isInitial = false, loadOlder = false) => {
        if (isLoadingRef.current || !room_sn) return;
        isLoadingRef.current = true;
        if (loadOlder) setIsLoadingOlder(true);

        const startTime = Date.now();

        try {
            const limit = 20;
            let messagesToDisplay = [];

            if (loadOlder) {
                // [Scenario A: Loading Old Data]
                const oldestSn = firstChatSnRef.current;

                // Capture height BEFORE DB load but AFTER checking loader
                // Since loader is already visible (isLoadingOlder=true), we must subtract its height if we want to anchor to content.
                // However, simpler: prevHeight = container.scrollHeight (includes loader).
                // After update: currHeight = container.scrollHeight (no loader since we turn it off).
                // diff = NewContent + OldContent - (Loader + OldContent) = NewContent - Loader.
                // scrollTop = NewContent - Loader.
                // This means we are anchor at top of OldContent. CORRECT.
                if (chatBoxRef.current) {
                    scrollStateRef.current = {
                        isRestoring: true,
                        prevHeight: chatBoxRef.current.scrollHeight
                    };
                }

                let dbMsgs = await ChatStorage.getMessages(limit, oldestSn);

                dbMsgs = [];

                if (dbMsgs.length < limit) {
                    const lastSn = dbMsgs.length > 0 ? dbMsgs[dbMsgs.length - 1].chat_sn : oldestSn;
                    const response = await ApiClient.get('/api/openchat/messages', {
                        params: { room_sn, limit: limit - dbMsgs.length, direction: 'older', before_chat_sn: lastSn }
                    });

                    if (response.data?.length > 0) {
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
                    const dbMsgs = await ChatStorage.getMessages(limit, null);

                    dbMsgs = [];

                    if (dbMsgs.length > 0) {
                        // ... (transformation logic handled below) ...
                        const transformed = dbMsgs.map(item => ({
                            id: item.chat_sn,
                            chat_sn: item.chat_sn,
                            is_deleted: item.is_deleted,
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

                        // Direct state set for initial load (avoids flicker)
                        setChatMessages(sorted);
                        if (sorted.length > 0) {
                            firstChatSnRef.current = sorted[0].chat_sn;
                            lastChatSnRef.current = sorted[sorted.length - 1].chat_sn;
                        }
                        // Initial Load => Force Scroll Bottom
                        //setTimeout(() => scrollToBottom('smooth'), 100);

                        // We set messagesToDisplay empty to skip the generic logic below for this block
                        // But wait, the below API call needs execution. 
                        // Actually, let's just let the generic logic handle API sync.
                    }
                }

                const lastSn = lastChatSnRef.current || 0;
                const response = await ApiClient.get('/api/openchat/messages', {
                    params: { room_sn, limit, direction: 'newer', last_chat_sn: lastSn }
                });

                if (response.data?.length > 0) {
                    await ChatStorage.saveMessages(response.data);
                    messagesToDisplay = response.data;
                }
            }

            if (messagesToDisplay.length === 0) {
                if (loadOlder) {
                    // Ensure loader is turned off if no data
                    const elapsed = Date.now() - startTime;
                    if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed));
                }
                return;
            }

            // Transform raw data to UI format
            const transformed = messagesToDisplay.map(item => ({
                id: item.chat_sn,
                chat_sn: item.chat_sn,
                is_deleted: item.is_deleted,
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
                // Determine Minimum Loading Time

                /*
                const elapsed = Date.now() - startTime;
                if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed));
                */

                setChatMessages(prev => {
                    const ids = new Set(prev.map(m => m.chat_sn));
                    const filtered = transformed.filter(m => !ids.has(m.chat_sn));
                    const newList = [...filtered.reverse(), ...prev];
                    if (newList.length > 0) firstChatSnRef.current = newList[0].chat_sn;
                    return newList;
                });
                // Note: useLayoutEffect will handle scrolling using scrollStateRef
            } else {
                // New messages (Initial sync/Polling)
                setChatMessages(prev => {
                    const ids = new Set(prev.map(m => m.chat_sn));
                    const filtered = transformed.filter(m => !ids.has(m.chat_sn)).sort((a, b) => a.chat_sn - b.chat_sn);
                    if (filtered.length === 0) return prev;

                    const newList = [...prev, ...filtered];
                    lastChatSnRef.current = newList[newList.length - 1].chat_sn;
                    return newList;
                });

                if (!isInitial && messagesToDisplay.length > 0) {
                    setShowFloatButton(true);
                } else if (messagesToDisplay.length > 0) {
                    // Initial sync: Force scroll if it's the very first load
                    if (isInitial) {
                        setTimeout(() => scrollToBottom('smooth'), 1000);
                    } else {
                        scrollToBottom('smooth');
                    }
                }
            }
        } catch (e) { console.error('GetChatting Error', e); }
        finally {
            isLoadingRef.current = false;
            setIsLoadingOlder(false);

            if (refreshUnreadCounts) {
                refreshUnreadCounts();
            }
        }
    }, [room_sn, user.user_id, formatTime, currentLang, scrollToBottom, refreshUnreadCounts]);

    useEffect(() => {
        getChattingData(true);
        intervalRef.current = setInterval(() => getChattingData(), 500);


        return () => clearInterval(intervalRef.current);
    }, [room_sn, getChattingData]);

    const isInitialScrollDone = useRef(false);
    const hasForcedScroll = useRef(false);

    useEffect(() => {
        if (!initScroll && chat_messages.length > 0 && !hasForcedScroll.current) {
            // Wait for paint, then force scroll
            if (chatBoxRef.current) {
                const { scrollHeight, clientHeight } = chatBoxRef.current;
                // Only scroll if there is content to scroll
                if (scrollHeight > clientHeight) {
                    hasForcedScroll.current = true; // Ensure this runs ONLY once
                    chatBoxRef.current.scrollTop = scrollHeight; // Immediate jump

                    // Allow "Load Older" trigger after a small delay ensuring scroll is settled
                    setTimeout(() => {
                        isInitialScrollDone.current = true;
                        setInitScroll(true);
                        scrollToBottom('smooth');
                    }, 100);
                }
            }
        }
    }, [chat_messages, initScroll]);



    const handleScroll = useCallback(() => {
        if (!chatBoxRef.current || isLoadingRef.current) return;

        // [Fix 2] Block logic if initial scroll hasn't finished
        if (!isInitialScrollDone.current) return;

        const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current; // Read layout immediately

        // 1. Check for Load Older (Immediate Trigger)
        if (!isLoadingOlder && hasMoreOlder && scrollTop < 50) {
            getChattingData(false, true);
        }

        // 2. Float Button & Other logic (Debounced)
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            const dist = scrollHeight - scrollTop - clientHeight;
            setShowFloatButton(dist > 300);
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
                await ChatStorage.softDeleteMessage(chat_sn);

                // Soft Delete: Update state instead of filtering
                setChatMessages(prev => prev.map(msg =>
                    msg.chat_sn === chat_sn ? { ...msg, is_deleted: 1 } : msg
                ));

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
                const chat_msg = res.chat_msg || '';
                const match = chat_msg.match(/src=['"]([^'"]+)['"]/);

                let img_src_ = match ? match[1] : null;

                console.log('real_url', img_src_);

                lastChatSnRef.current = realChatSn;

                // RECONCILE & SAVE TO DB
                const confirmedData = {
                    chat_sn: realChatSn,
                    sender_id: user.user_id,
                    message: '',
                    image_url: fileType === 'image' ? img_src_ || realUrl : null,
                    video_url: fileType === 'video' ? img_src_ || realUrl : null,
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
                            image: fileType === 'image' ? img_src_ || realUrl : null,
                            video: fileType === 'video' ? img_src_ || realUrl : null,
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
            setTimeout(() => scrollToBottom('auto', true), 10);
        }
    };

    // --- Message Render ---
    const ChatMessage = React.memo(({ msg, setModalImage, translation, onTranslate, onDelete }) => {
        const isMine = msg.sender === 'me';
        // Soft Delete Logic
        if (msg.is_deleted) {
            return (
                <div className={`message-row ${msg.sender} deleted`}>
                    {!isMine && (
                        <div className="profile-wrapper">
                            <img src={USER_LEVEL_ICONS[msg.sender_level] || USER_LEVEL_ICONS[1]} alt="lv" className="lv-icon" />
                        </div>
                    )}
                    <div className="bubble-container">
                        {!isMine && <div className="sender-name">{msg.rank_name} {msg.sender_name}</div>}
                        <div className="bubble" style={{ color: '#999', backgroundColor: '#f0f0f0', userSelect: 'none' }}>
                            [삭제된 메시지 입니다]
                        </div>
                    </div>
                </div>
            );
        }

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
                            {(msg.image && msg.text == '') && <img src={msg.image} className="chat-img" onClick={() => setModalImage(msg.image)} alt="chat" />}
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
                    position: absolute;
                    top: 10px;
                    left: 0;
                    right: 0;
                    display: flex;
                    justify-content: center;
                    z-index: 10;
                    pointer-events: none;
                }
                .spinner {
                    animation: spin 1s linear infinite;
                    color: #adb5bd;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

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
                    user-select: none;
                    -webkit-user-select: none;
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
                <SketchHeader
                    rightButtons={[
                        {
                            icon: Menu,
                            onClick: async () => {
                                try {
                                    const res = await ApiClient.get('/api/openchat/getCurrentUser');
                                    const { data = [] } = res;
                                    setOnlineUsers(data);
                                    setShowUserList(true);
                                } catch (e) {
                                    console.error("Failed to fetch users", e);
                                    // Fallback or silently fail
                                }
                            }
                        }
                    ]}
                    title={roomTitle} showBack={true} onBack={() => {
                        navigateToPage(PAGES.HOME);
                    }} />

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
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onClick={() => {
                        textareaRef?.current?.focus();
                    }}
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

            <UserListDrawer
                show={showUserList}
                onClose={() => setShowUserList(false)}
                users={onlineUsers}
                currentLang={currentLang}
                currentUser={user}
            />
        </>
    );
};

export default OpenChatPage;