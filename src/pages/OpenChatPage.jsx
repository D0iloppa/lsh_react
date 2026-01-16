import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { ImageIcon, Loader2, ArrowDown, SendHorizonal, Menu, X, Edit3, Check, MessageSquare, Heart, Trash2 } from 'lucide-react';
import SketchHeader from '@components/SketchHeader';

import { useMsg } from '@contexts/MsgContext';
import { useAuth } from '../contexts/AuthContext';
import '@components/SketchComponents.css';
import ApiClient from '@utils/ApiClient';
import ChatStorage from '@utils/ChatStorage';
import Swal from 'sweetalert2';
import {
    requestCameraPermission as requestCameraPermissionNative,
    requestCameraPermissionNotification
} from '@utils/nativeBridge';



// --- Sub Components ---

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

const UserListDrawer = React.memo(({ show, onClose, users, currentLang, currentUser, onEditNickname }) => {
    // Prevent background scroll when open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        }
    }, [show]);

    // Group users by level/rank (Excluding Me)
    const groupedUsers = React.useMemo(() => {
        const groups = {};
        users.forEach(u => {
            // Skip Current User for this list
            if (currentUser && (u.nickname === currentUser.name || u.nickname === currentUser.nickname)) return;

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

        // Process each group: Sort by nickname
        Object.values(groups).forEach(group => {
            group.users.sort((a, b) => (a.nickname || '').localeCompare(b.nickname || ''));
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
                    {/* Me Section */}
                    {(() => {
                        if (!currentUser) return null;
                        // Find full user info from the list if possible to get rank name, color, etc.
                        const meFull = users.find(u =>
                            String(u.user_id) === String(currentUser.user_id) ||
                            u.nickname === currentUser.nickname ||
                            u.nickname === currentUser.name
                        ) || currentUser;

                        const myLevel = meFull.user_lvl || currentUser.level || 1;
                        const myColor = meFull.code_color || currentUser.color || '#333';
                        const myRankName = meFull['msg_' + (currentLang || 'kr')] || meFull.msg_kr || 'Member';
                        const myName = meFull.nickname || meFull.name || currentUser.nickname || currentUser.name;

                        return (
                            <div className="user-group me-section">
                                <div className="group-header" style={{ color: myColor }}>
                                    <span className="group-name">나 (Me)</span>
                                </div>
                                <div className="user-item-simple me-item">
                                    <div className="profile-wrapper-sm">
                                        <img src={USER_LEVEL_ICONS[myLevel] || USER_LEVEL_ICONS[1]} alt="lv" />
                                    </div>
                                    <div style={{ flex: 1, marginLeft: '8px' }}>
                                        <span className="nickname" style={{ fontWeight: 'bold' }}>{myName}</span>
                                        <div className="user-meta" style={{ fontSize: '11px', color: '#868e96' }}>
                                            {`${myLevel > 10 ? `` : `Lv.${myLevel}`} ${myRankName}`}
                                        </div>
                                    </div>
                                    <button className="edit-nick-btn" onClick={onEditNickname}>
                                        <Edit3 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })()}

                    {groupedUsers.map(group => (
                        <div key={group.level} className="user-group">
                            <div className="group-header" style={{ color: group.color }}>
                                <div className="header-icon-wrapper">
                                    <img src={USER_LEVEL_ICONS[group.level] || USER_LEVEL_ICONS[1]} alt="lv" />
                                </div>
                                <span className="group-name">{`${group.level > 10 ? `🤠 ` : `Lv. ${group.level}`} ` + group.name} — {group.users.length}</span>
                            </div>
                            <div className="group-items">
                                {group.users.map((u, i) => (
                                    <div className="user-item-simple" key={u.nickname + i}>
                                        <div className="status-dot" style={{ backgroundColor: group.color }}></div>
                                        <span className="nickname">{u.nickname}</span>
                                    </div>
                                ))}
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
                .me-section { border-bottom: 2px dashed #f1f3f5; padding-bottom: 15px; margin-bottom: 15px; }
                
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
                }
                .me-item { background: #f8f9fa; border: 1px solid #e9ecef; }
                
                .status-dot {
                    width: 6px; height: 6px; border-radius: 50%; margin-right: 10px; opacity: 0.5;
                }
                .nickname { font-weight: 500; }
                
                .edit-nick-btn {
                    background: #fff; border: 1px solid #dee2e6; border-radius: 4px;
                    padding: 4px; cursor: pointer; color: #495057;
                    display: flex; align-items: center; justify-content: center;
                    margin-left: auto;
                }
                .edit-nick-btn:hover { background: #e9ecef; }
                .profile-wrapper-sm { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; margin-right: 0; border: 1px solid #e9ecef; }
                .profile-wrapper-sm img { width: 100%; height: 100%; object-fit: cover; }
            `}</style>
        </>
    );
});


let initialScrollY = 0;


const ContextMenu = ({ data, onClose, onLike, onReply, onDelete }) => {
    if (!data) return null;
    const { x, y } = data.coords;
    const isMine = data.msg.sender === 'me';

    // Prevent overflow (Simple clamping)
    const screenW = window.innerWidth;
    const menuHalfWidth = 90; // Approx half of min-width 160px + padding
    let safeLeft = x;
    if (safeLeft < menuHalfWidth) safeLeft = menuHalfWidth + 4;
    if (safeLeft > screenW - menuHalfWidth) safeLeft = screenW - menuHalfWidth - 4;

    const style = {
        position: 'fixed',
        top: y - 8,
        left: safeLeft,
        transform: 'translate(-50%, -100%)',
        backgroundColor: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        borderRadius: '12px',
        zIndex: 9999,
        overflow: 'hidden',
        minWidth: '160px',
        display: 'flex',
        flexDirection: 'column',
        padding: '4px',
        border: '1px solid #f1f3f5'
    };

    return (
        <>
            <div className="context-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
            <div className="context-menu" style={style}>
                <button onClick={() => { onReply(data.msg); onClose(); }}>
                    <MessageSquare size={16} style={{ marginRight: '8px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>답변</span>
                </button>
                <button onClick={() => { onLike(data.msg); onClose(); }}>
                    <Heart
                        size={16}
                        style={{ marginRight: '8px' }}
                        fill={data.msg.is_liked_by_me ? "#fa5252" : "none"}
                        color={data.msg.is_liked_by_me ? "#fa5252" : "currentColor"}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>좋아요</span>
                </button>
                {isMine && (
                    <button onClick={() => { onDelete(data.msg.chat_sn); onClose(); }} style={{ color: '#e03131' }}>
                        <Trash2 size={16} style={{ marginRight: '8px' }} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>삭제</span>
                    </button>
                )}
            </div>
            <style jsx="true">{`
                .context-menu button {
                    width: 100%;
                    padding: 10px 12px;
                    border: none;
                    background: transparent;
                    text-align: left;
                    color: #495057;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    border-radius: 8px;
                    transition: background 0.1s;
                }
                .context-menu button:active { background-color: #f1f3f5; }
            `}</style>
        </>
    );
};

const LikeUsersModal = ({ show, onClose, users, loading }) => {
    if (!show) return null;
    return (
        <div className="like-modal-overlay" onClick={onClose}>
            <div className="like-modal-content" onClick={e => e.stopPropagation()}>
                <div className="like-modal-header">
                    <h4>좋아요 ({loading ? '...' : users.length})</h4>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="like-user-list">
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                            <Loader2 className="spinner" size={24} color="#adb5bd" />
                        </div>
                    ) : (
                        users.map(u => (
                            <div key={u.user_id} className="like-user-item">
                                <div className="profile-wrapper-sm">
                                    <img src={USER_LEVEL_ICONS[u.level] || USER_LEVEL_ICONS[1]} alt="lv" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="name">{u.nickname}</span>
                                    {u.time && <span className="time">{u.time}</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <style jsx="true">{`
                .like-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; }
                .like-modal-content { background: white; width: 300px; max-height: 400px; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
                .like-modal-header { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
                .like-modal-header h4 { margin: 0; font-size: 16px; }
                .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #868e96; }
                .like-user-list { flex: 1; overflow-y: auto; padding: 0; }
                .like-user-item { padding: 10px 16px; border-bottom: 1px solid #f8f9fa; display: flex; align-items: center; }
                .profile-wrapper-sm { width: 32px; height: 32px; border-radius: 8px; overflow: hidden; margin-right: 12px; border: 1px solid #eee; flex-shrink: 0; }
                .profile-wrapper-sm img { width: 100%; height: 100%; object-fit: contain; }
                .name { font-size: 14px; font-weight: 500; color: #343a40; }
                .time { font-size: 11px; color: #adb5bd; }
            `}</style>
        </div>
    );
};

const ImageWithSkeleton = ({ src, onClick, alt, className }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={className} onClick={onClick} style={{ position: 'relative', overflow: 'hidden', minHeight: loaded ? 'auto' : '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!loaded && (
                <div className="skeleton" style={{ width: '100%', height: '200px', position: 'absolute', inset: 0 }} />
            )}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                style={{
                    display: loaded ? 'block' : 'none',
                    width: '100%',
                    height: 'auto',
                    borderRadius: 'inherit' // Inherit from parent bubble/img class
                }}
            />
        </div>
    );
};

const ReplyIndicator = ({ replyingTo, onClose }) => {
    if (!replyingTo) return null;

    // Determine display text
    let displayText = replyingTo.text || '';
    if (displayText.startsWith('<img') || displayText.includes('<img src=')) {
        displayText = '[사진]';
    } else if (!displayText && replyingTo.image) {
        displayText = '[사진]';
    } else if (!displayText) {
        displayText = '...';
    }

    return (
        <div className="reply-indicator">
            <div className="reply-content">
                <span className="reply-title">답변: {replyingTo.sender_name}</span>
                <p className="reply-preview">{displayText}</p>
            </div>
            <button className="close-btn" onClick={onClose}><Loader2 size={16} style={{ transform: 'rotate(45deg)' }} /></button>
            <style jsx="true">{`
                .reply-indicator {
                    position: fixed;
                    bottom: calc(146px + var(--safe-bottom, 0px)); /* ChatInput Height + gap */
                    left: 10px; right: 10px;
                    background: rgba(255, 255, 255, 0.95);
                    border-left: 4px solid #4dabf7;
                    border-radius: 4px;
                    padding: 10px 14px;
                    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
                    z-index: 95;
                    display: flex; justify-content: space-between; align-items: center;
                    backdrop-filter: blur(5px);
                }
                .reply-content { flex: 1; overflow: hidden; }
                .reply-title { font-size: 12px; color: #4dabf7; font-weight: bold; display: block; margin-bottom: 2px; }
                .reply-preview { font-size: 13px; color: #495057; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
                .close-btn { background: none; border: none; padding: 4px; cursor: pointer; color: #868e96; }

                @keyframes highlight {
                    0% { background-color: rgba(77, 171, 247, 0.2); }
                    100% { background-color: transparent; }
                }
                .highlight-msg { animation: highlight 2s ease-out; }

                
            `}</style>
        </div>
    );
};


// --- Main Component ---

const OpenChatPage = ({ navigateToPage, navigateToPageWithData, PAGES, goBack, refreshUnreadCounts, ...otherProps }) => {

    const textareaRef = useRef < HTMLTextAreaElement > (null);
    const [isFocus, setIsFocus] = useState(false);


    const { get, currentLang } = useMsg();
    const { user, updateLoginState } = useAuth();

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
    const [contextMenuData, setContextMenuData] = useState(null);
    const [likeModalData, setLikeModalData] = useState({ show: false, users: [], loading: false });
    const [replyingTo, setReplyingTo] = useState(null);

    const [returnScrollPos, setReturnScrollPos] = useState(null);
    const [showReturnBtn, setShowReturnBtn] = useState(false);
    const [originChatSn, setOriginChatSn] = useState(null);

    const intervalRef = useRef(null);
    const statusIntervalRef = useRef(null);
    const lastChatSnRef = useRef(null);
    const firstChatSnRef = useRef(null); // 과거 데이터 로딩용 기준점
    const chatBoxRef = useRef(null);
    const chatInputRef = useRef(null);
    const isScrollingRef = useRef(false);
    const isLoadingRef = useRef(false);
    const scrollTimeoutRef = useRef(null);


    const [cameraGranted, setCameraGranted] = useState(null);

    const requestCameraPermission = async () => {
        try {
            const granted = await requestCameraPermissionNative();
            setCameraGranted(granted);
            return granted;
        } catch (e) {
            setCameraGranted(0);
            return false;
        }
    };

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

        // 진입 시 카메라 권한 요청
        requestCameraPermission();
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
                    let dbMsgs = await ChatStorage.getMessages(limit, null);

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
            const transformed = messagesToDisplay.map(item => {
                let replyParent = null;
                if (item.reply_message) {
                    try {
                        // Assuming reply_message is a JSON string
                        const parsed = typeof item.reply_message === 'string'
                            ? JSON.parse(item.reply_message)
                            : item.reply_message;

                        // Normalize parsed object to match UI format if necessary, 
                        // or just use it raw if fields match (sender_name, text, etc.)

                        let pText = parsed.message || parsed.chat_msg || '';
                        if (pText.startsWith('<img') || pText.includes('<img src=')) {
                            pText = '[사진]';
                        }

                        replyParent = {
                            chat_sn: parsed.chat_sn,
                            sender_name: parsed.sender_name,
                            text: pText,
                            image: parsed.image_url,
                        };
                    } catch (e) {
                        console.error('Failed to parse reply_message', item.reply_message);
                    }
                }

                return {
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
                    reply_to: item.reply_to,
                    reply_parent: replyParent
                };
            });


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

    const getChatStatus = useCallback(async () => {
        if (!chat_messages.length || !user.user_id) return;

        // Collect chat_sn list
        const chat_sn_list = chat_messages.map(m => m.chat_sn);

        try {
            const res = await ApiClient.postForm('/api/openchat/chatStatus', {
                chat_sn_list,
                user_id: user.user_id
            });

            if (res.data && Array.isArray(res.data)) {
                // response.data = [ { chat_sn, is_deleted, like_count, is_liked_by_me }, ... ]

                const statusMap = new Map();
                res.data.forEach(item => statusMap.set(item.chat_sn, item));

                setChatMessages(prev => prev.map(msg => {
                    const status = statusMap.get(msg.chat_sn);
                    if (!status) return msg;

                    const isChanged =
                        msg.is_deleted !== status.is_deleted ||
                        msg.like_count !== status.like_count ||
                        msg.is_liked_by_me !== status.is_liked_by_me;

                    if (!isChanged) return msg;

                    return {
                        ...msg,
                        is_deleted: status.is_deleted,
                        like_count: status.like_count,
                        is_liked_by_me: status.is_liked_by_me
                    };
                }));
            }
        } catch (e) {
            console.error("Failed to poll chat status", e);
        }
    }, [chat_messages, user.user_id]);

    useEffect(() => {
        getChattingData(true);

        intervalRef.current = setInterval(() => {
            getChattingData();
            getChatStatus();
        }, 500);

        //statusIntervalRef.current = setInterval(() => getChatStatus(), 500); // Poll status every 3s

        return () => {
            clearInterval(intervalRef.current);
            clearInterval(statusIntervalRef.current);
        };
    }, [room_sn, getChattingData, getChatStatus]);

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
        if (!chatBoxRef.current) return;

        // [Fix 2] Block logic if initial scroll hasn't finished
        if (!isInitialScrollDone.current) return;

        const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current; // Immediate for Load Older

        // 1. Check for Load Older (Immediate Trigger) - Blocked by isLoadingRef
        if (!isLoadingRef.current && !isLoadingOlder && hasMoreOlder && scrollTop < 50) {
            getChattingData(false, true);
        }

        // 2. Float Button & Other logic (Debounced) - NOT blocked by isLoadingRef
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            // Re-read metrics to ensure we have the SETTLED position
            if (chatBoxRef.current) {
                const { scrollTop: finalTop, scrollHeight: finalHeight, clientHeight: finalClient } = chatBoxRef.current;
                const dist = finalHeight - finalTop - finalClient;
                // Use a small buffer (e.g., 5px) to account for sub-pixel differences
                setShowFloatButton(dist > 300);
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

    // Memoize Msg Map for O(1) lookup
    const msgMap = React.useMemo(() => {
        const map = new Map();
        chat_messages.forEach(m => map.set(m.chat_sn, m));
        return map;
    }, [chat_messages]);

    const handleMessageSend = useCallback(async (message) => {
        if (!message.trim() || isLoadingRef.current) return;
        const now = new Date();
        const tempId = Date.now();
        const uiMsg = {
            id: tempId,
            chat_sn: tempId,
            sender: 'me',
            text: message,
            time: formatTime(now),
            sender_name: user.name || 'Me',
            sender_level: user.level,
            sender_color: user.color, // Assuming user object might have this, or fallback
            reply_to: replyingTo?.chat_sn || null, // Include reply_to in optimistic UI
        };

        setChatMessages(prev => [...prev, uiMsg]);
        setTimeout(() => scrollToBottom('auto', true), 0);
        setReplyingTo(null); // Clear reply state after sending
        isLoadingRef.current = true; // Temporary lock

        try {
            // User Request: Fix API call (Text should be JSON usually, but check if postForm was intended.
            // Previous working code used `ApiClient.post` for text.
            const payload = {
                room_sn,
                sender_id: user.user_id,
                chat_msg: message,
                type: 'text',
                ...(uiMsg.reply_to && { reply_to: uiMsg.reply_to }) // Only add if exists
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
                    room_sn: room_sn,
                    reply_to: uiMsg.reply_to, // Save reply_to to DB
                };
                await ChatStorage.saveMessages([confirmedData]);

                // Reconcile: Update the optimistic message with real chat_sn
                setChatMessages(prev => prev.map(m => {
                    if (m.id === tempId) {
                        return { ...m, chat_sn: realChatSn, isUploading: false }; // Clear isUploading
                    }
                    return m;
                }));
            } else {
                // If API call was successful but no chat_sn returned, remove optimistic message
                setChatMessages(prev => prev.filter(m => m.id !== tempId));
            }

            lastChatSnRef.current = realChatSn;

        } catch (e) {
            console.error('Message Send Failed:', e);
            // Optionally mark error or remove
            setChatMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            isLoadingRef.current = false; // Release lock
        }
    }, [room_sn, user.user_id, user.name, user.level, user.color, formatTime, scrollToBottom, replyingTo]);

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

    // --- Handlers for Like / Reply ---
    const handleLike = useCallback(async (msg) => {
        // Optimistic Update
        const targetSn = msg.chat_sn;
        const isCurrentlyLiked = msg.is_liked_by_me;

        setChatMessages(prev => prev.map(m => {
            if (m.chat_sn === targetSn) {
                return {
                    ...m,
                    is_liked_by_me: !isCurrentlyLiked,
                    like_count: Math.max(0, m.like_count + (isCurrentlyLiked ? -1 : 1))
                };
            }
            return m;
        }));

        try {
            await ApiClient.postForm('/api/openchat/reaction', {
                chat_sn: msg.chat_sn,
                user_id: user.user_id
            });
        } catch (e) {
            console.error(e);
            // Rollback on error (Optional, but good practice)
            setChatMessages(prev => prev.map(m => {
                if (m.chat_sn === targetSn) {
                    return {
                        ...m,
                        is_liked_by_me: isCurrentlyLiked,
                        like_count: Math.max(0, m.like_count + (isCurrentlyLiked ? 1 : -1))
                    };
                }
                return m;
            }));
        }
    }, [user.user_id]);

    const handleReply = useCallback((msg) => {
        setReplyingTo(msg);
        if (chatInputRef.current?.inputRef?.current) {
            chatInputRef.current.inputRef.current.focus();
        }
    }, []);

    const handleShowLikers = useCallback(async (msg) => {
        setLikeModalData({ show: true, users: [], loading: true });

        try {
            const res = await ApiClient.postForm('/api/openchat/reaction_list', {
                chat_sn: msg.chat_sn
            });

            if (res && res.list) {
                const users = res.list.map(u => ({
                    user_id: u.user_id,
                    nickname: u.nickname,
                    level: u.user_lvl,
                    time: u.reg_dt ? formatTime(new Date(u.reg_dt)) : ''
                }));
                setLikeModalData({ show: true, users, loading: false });
            } else {
                setLikeModalData({ show: true, users: [], loading: false });
            }
        } catch (e) {
            console.error("Failed to fetch likers", e);
            setLikeModalData({ show: true, users: [], loading: false });
        }
    }, []);

    const handleContextMenuAction = useCallback((msg, coords) => {
        setContextMenuData({ msg, coords });
    }, []);

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
            isUploading: true,
            reply_to: replyingTo?.chat_sn || null, // Include reply_to for files
        };

        setChatMessages(prev => [...prev, uiMsg]);
        scrollToBottom('auto', true);
        setReplyingTo(null); // Clear reply state after sending file
        isLoadingRef.current = true; // Temporary lock

        try {
            const formData = new FormData();
            formData.append('room_sn', room_sn);
            formData.append('user_id', user.user_id);
            formData.append('sender_id', user.user_id);
            formData.append('chat_msg', '');
            formData.append('type', fileType);
            formData.append('file', file);
            if (uiMsg.reply_to) {
                formData.append('reply_to', uiMsg.reply_to); // Include reply_to in file upload payload
            }

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
                const chat_msg = res.data.chat_msg || ''; // Access chat_msg from res.data
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
                    room_sn: room_sn,
                    reply_to: uiMsg.reply_to, // Save reply_to to DB for files
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


    // Helper: Trigger Shake Animation
    const triggerShakeAnimation = (targetEl) => {
        const bubbleEl = targetEl.querySelector('.bubble');
        if (bubbleEl) {
            bubbleEl.classList.remove('shake-msg', 'highlight-msg');
            void bubbleEl.offsetWidth; // Force Reflow
            bubbleEl.classList.add('shake-msg', 'highlight-msg');
            setTimeout(() => {
                bubbleEl.classList.remove('shake-msg', 'highlight-msg');
            }, 2000);
        }
    };

    // Return to Original Message Logic
    const handleReturnToOrigin = () => {
        if (returnScrollPos !== null && chatBoxRef.current) {
            chatBoxRef.current.scrollTo({
                top: returnScrollPos,
                behavior: 'smooth'
            });
            setShowReturnBtn(false);
            setReturnScrollPos(null);

            // Animate Origin Message if exists
            if (originChatSn) {
                const originEl = document.getElementById(`msg-${originChatSn}`);
                if (originEl) {
                    // Slight delay to allow scroll to start/finish
                    setTimeout(() => triggerShakeAnimation(originEl), 500);
                }
                setOriginChatSn(null);
            }
        }
    };

    // Handle Reply Link Click (Navigate to Target)
    const handleReplyLinkClick = useCallback((targetSn, currentSn) => {
        if (!targetSn) return;
        const targetEl = document.getElementById(`msg-${targetSn}`);

        if (targetEl && chatBoxRef.current) {
            // 1. Save Current Position & Origin
            setReturnScrollPos(chatBoxRef.current.scrollTop);
            setOriginChatSn(currentSn);
            setShowReturnBtn(true);

            // 2. Scroll to Target
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 3. Robust Animation Trigger (Wait for scroll end)
            const container = chatBoxRef.current; // chat-messages ref
            let lastScrollTop = container.scrollTop;
            let checks = 0;
            const checkScrollEnd = () => {
                const currentScroll = container.scrollTop;
                if (Math.abs(currentScroll - lastScrollTop) < 2) {
                    checks++;
                    if (checks >= 2) { // Stable for 2 checks (approx 100ms)
                        triggerShakeAnimation(targetEl);
                        return;
                    }
                } else {
                    checks = 0;
                    lastScrollTop = currentScroll;
                }
                requestAnimationFrame(checkScrollEnd);
            };
            // Start checking
            requestAnimationFrame(checkScrollEnd);

        } else {
            // Target not found (maybe unloaded?)
            Swal.fire({
                icon: 'info',
                text: '원본 메시지를 찾을 수 없습니다.',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'bottom'
            });
        }
    }, []);

    // --- Message Render ---
    const ChatMessage = React.memo(({ msg, parentMsg, setModalImage, translation, onTranslate, onDelete, onContextMenu, onLike, onShowLikers, onReplyLinkClick }) => {
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
                        {!isMine && <div className="sender-info">
                            <span className="rank" style={{ color: msg.sender_color, fontWeight: 'bold' }}> {msg.sender_level < 10 ? `Lv.${msg.sender_level} ` : '🤠'}{msg.rank_name}</span>
                            <span className="name" style={{ color: '#868e96' }}>{msg.sender_name}</span>
                        </div>}
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

        // Long press & Double Tap handling
        const timerRef = useRef(null);
        const lastTapRef = useRef(0);

        const handleTouchStart = (e) => {
            // Always trigger ContextMenu on long press
            // Capture coordinates
            const touch = e.touches ? e.touches[0] : (e.nativeEvent ? e.nativeEvent : e);
            const coords = { x: touch.clientX, y: touch.clientY };

            timerRef.current = setTimeout(() => {
                if (navigator.vibrate) navigator.vibrate(50); // Haptic Feedback
                onContextMenu(msg, coords);
            }, 800);
        };

        const handleTouchEnd = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };

        const likeColor = msg.is_liked_by_me ? '#fa5252' : '#adb5bd'; // Red if liked, Gray otherwise
        const hasLikes = msg.like_count > 0;

        const handleReplyClick = (e) => {
            e.stopPropagation();
            if (msg.reply_to && onReplyLinkClick) {
                onReplyLinkClick(msg.reply_to, msg.chat_sn);
            }
        };

        return (
            <div id={`msg-${msg.chat_sn}`} className={`message-row ${msg.sender}`}>
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
                            onClick={(e) => {
                                // Double Tap Detection (Manual)
                                const now = Date.now();
                                if (now - lastTapRef.current < 300) {
                                    if (onLike) onLike(msg);
                                    e.stopPropagation(); // Stop zoom or other clicks
                                }
                                lastTapRef.current = now;
                            }}
                        >
                            {/* Reply Quote Block */}
                            {msg.reply_to && (
                                <div className="reply-quote" onClick={handleReplyClick} style={{
                                    borderBottom: isMine ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.1)',
                                    marginBottom: '8px',
                                    paddingBottom: '6px',
                                    opacity: 0.9,
                                    fontSize: '13px',
                                    display: 'flex', flexDirection: 'column',
                                    cursor: 'pointer'
                                }}>
                                    <div style={{
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                        color: isMine ? '#fff' : '#212529',
                                        marginBottom: '4px'
                                    }}>
                                        답변 : {parentMsg ? parentMsg.sender_name : '알 수 없는 사용자'}
                                    </div>
                                    <div style={{
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px',
                                        fontSize: '12.5px',
                                        color: isMine ? 'rgba(255,255,255,0.9)' : '#495057',
                                        fontWeight: '400'
                                    }}>
                                        {(() => {
                                            if (!parentMsg) return '삭제되거나 오래된 메시지입니다.';
                                            let pText = parentMsg.text || '';
                                            if (pText.startsWith('<img') || pText.includes('<img src=')) {
                                                return '[사진]';
                                            }
                                            return pText || (parentMsg.image ? '[사진]' : '...');
                                        })()}
                                    </div>
                                </div>
                            )}

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
                            {(msg.image && msg.text == '') && (
                                <ImageWithSkeleton
                                    src={msg.image}
                                    className="chat-img"
                                    onClick={() => setModalImage(msg.image)}
                                    alt="chat"
                                />
                            )}
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
                    {/* Like Indicator */}
                    {hasLikes && (
                        <div className="like-indicator" onClick={() => onShowLikers(msg)} style={{
                            alignSelf: isMine ? 'flex-end' : 'flex-start',
                            marginTop: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: msg.is_liked_by_me ? '#fff0f6' : '#fff', // Highlight if liked
                            border: msg.is_liked_by_me ? '1px solid #ffdeeb' : '1px solid #eee',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            <span style={{ fontSize: '11px', color: msg.is_liked_by_me ? '#e64980' : '#adb5bd', marginRight: '4px', lineHeight: 1 }}>
                                {msg.is_liked_by_me ? '♥' : '♡'}
                            </span>
                            <span style={{ fontSize: '11px', color: msg.is_liked_by_me ? '#d6336c' : '#868e96', lineHeight: 1, fontWeight: '600' }}>
                                {msg.like_count}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    });

    // ReplyIndicator Component
    const ReplyIndicator = ({ replyingTo, onClose }) => {
        if (!replyingTo) return null;

        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', backgroundColor: '#e9ecef', borderTop: '1px solid #dee2e6',
                fontSize: '14px', color: '#495057',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                    <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {replyingTo.sender_name}에게 답장
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', opacity: 0.8 }}>
                        {replyingTo.text || (replyingTo.image ? '사진' : '메시지')}
                    </span>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                    <X size={18} color="#495057" />
                </button>
            </div>
        );
    };

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
                    flex-direction: column; /* Changed to column to stack reply indicator */
                    align-items: stretch; /* Stretch items horizontally */
                    padding: 0 12px 8px 12px; /* Adjusted padding */
                    border-top: 1px solid #e9ecef;
                    z-index: 100;
                    gap: 8px;
                }
                .input-row { /* New div for input and buttons */
                    display: flex;
                    align-items: center;
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
                    {/* Return to Origin Button */}
                    {showReturnBtn && (
                        <div onClick={handleReturnToOrigin} style={{
                            position: 'fixed',
                            bottom: '160px', // Above input area
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            zIndex: 90,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}>
                            <ArrowDown size={14} /> 원래 위치로
                        </div>
                    )}

                    {isLoadingOlder && (
                        <div className="top-loader">
                            <Loader2 className="spinner" size={24} />
                        </div>
                    )}

                    {chat_messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            msg={msg}
                            parentMsg={msg.reply_parent || (msg.reply_to ? msgMap.get(msg.reply_to) : null)}
                            setModalImage={setModalImage}
                            translation={translationMap[msg.chat_sn]}
                            onTranslate={handleTranslate}

                            onContextMenu={handleContextMenuAction}
                            onLike={handleLike}
                            onShowLikers={handleShowLikers}
                            onReplyLinkClick={handleReplyLinkClick}
                            onDelete={handleDeleteMessage}
                        />
                    ))}
                </div>

                <FloatBottomButton isVisible={showFloatButton} onClick={() => scrollToBottom('smooth')} />
            </div >

            <div className="chat-input-wrapper">
                <ReplyIndicator replyingTo={replyingTo} onClose={() => setReplyingTo(null)} />
                <div className="input-row">
                    <button className="icon-btn" onClick={async () => {
                        const isGranted = await requestCameraPermission();


                        if (isGranted) {
                            document.getElementById('media-upload-input').click();
                        } else {

                            // ios
                            if (window.webkit?.messageHandlers?.native?.postMessage) {
                                window.webkit.messageHandlers.native.postMessage(
                                    'requestCameraPermissionAlert'
                                );
                            }
                            // Android WebView
                            else if (window.native?.postMessage) {
                                //window.native.postMessage('requestCameraPermission');
                                Swal.fire({
                                    title: '카메라 권한 필요',
                                    html: `
                                        <div style="font-size: 15px; color: #495057; line-height: 1.6;">
                                            사진 촬영 및 파일 첨부를 위해<br/>
                                            <b>카메라 접근 권한</b>이 필요합니다.<br/><br/>
                                            휴대폰 <b>설정</b>에서 카메라 권한을<br/>
                                            허용으로 변경해주세요.
                                        </div>
                                    `,
                                    icon: 'warning',
                                    confirmButtonText: '확인',
                                    confirmButtonColor: '#4dabf7',
                                    width: '320px',
                                    padding: '1.5em'
                                });
                            }

                            // else
                            else {
                                document.getElementById('media-upload-input').click();
                            }

                        }
                    }}>
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
            </div>

            {
                modalImage && (
                    <div className="image-modal" onClick={() => setModalImage(null)}>
                        <img src={modalImage} alt="zoom" />
                    </div>
                )
            }

            <UserListDrawer
                show={showUserList}
                onClose={() => setShowUserList(false)}
                users={onlineUsers}
                currentLang={currentLang}
                currentUser={user}
                onEditNickname={async () => {
                    const { value: nickname } = await Swal.fire({
                        title: '닉네임 변경',
                        input: 'text',
                        inputLabel: '변경할 닉네임을 입력하세요',
                        inputValue: user.nickname || user.name,
                        showCancelButton: true,
                        confirmButtonText: '변경',
                        cancelButtonText: '취소',
                        inputValidator: (value) => {
                            if (!value) {
                                return '닉네임을 입력해주세요!';
                            }
                        }
                    });

                    if (nickname) {
                        try {
                            // 1. Check Duplicate
                            const chkRes = await ApiClient.postForm('/api/openchat/nickname_chk', {
                                user_id: user.user_id,
                                nickname: nickname
                            });

                            if (chkRes.isDuplicate) {
                                Swal.fire('중복됨', '이미 사용 중인 닉네임입니다.', 'error');
                                return;
                            }

                            // 2. Update Nickname
                            const updateRes = await ApiClient.postForm('/api/openchat/nickname_edit', {
                                user_id: user.user_id,
                                nickname: nickname
                            });

                            if (updateRes.success) {
                                Swal.fire('성공', '닉네임이 변경되었습니다.', 'success');

                                // Update Global User Context
                                updateLoginState({ ...user, name: nickname, nickname: nickname });

                                // Refresh Online User List
                                try {
                                    const res = await ApiClient.get('/api/openchat/getCurrentUser');
                                    setOnlineUsers(res.data || []);
                                } catch (err) {
                                    console.error("Failed to refresh user list", err);
                                }
                            } else {
                                Swal.fire('오류', '닉네임 변경에 실패했습니다.', 'error');
                            }
                        } catch (e) {
                            console.error(e);
                            Swal.fire('오류', '서버 통신 오류', 'error');
                        }
                    }
                }}
            />

            <ContextMenu
                data={contextMenuData}
                onClose={() => setContextMenuData(null)}
                onLike={handleLike}
                onReply={handleReply}
                onDelete={handleDeleteMessage}
            />

            <LikeUsersModal
                show={likeModalData.show}
                users={likeModalData.users}
                loading={likeModalData.loading}
                onClose={() => setLikeModalData(prev => ({ ...prev, show: false }))}
            />
            <style>{`
                @keyframes shake-vertical {
                    0% { transform: translateY(0); }
                    20% { transform: translateY(-6px); }
                    40% { transform: translateY(6px); }
                    60% { transform: translateY(-3px); }
                    80% { transform: translateY(3px); }
                    100% { transform: translateY(0); }
                }
                .shake-msg { animation: shake-vertical 0.5s ease-in-out both; }
                
                /* Skeleton Loader */
                .skeleton {
                    background-color: #e0e0e0;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default OpenChatPage;