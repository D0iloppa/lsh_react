import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/mousewheel";
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, X, Send } from "lucide-react";
import ApiClient from '@utils/ApiClient';

import { useAuth } from '@contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

import Swal from 'sweetalert2';

// ========================================
// 유틸리티 함수 - 백엔드 데이터 정규화
// ========================================

const normalizeVideoData = (video) => ({
  video_id: video.video_id,
  user_id: video.user_id,
  owner_id: video.owner_id,
  owner_type: video.owner_type,
  title: video.title,
  s_path: video.s_path,
  created_at: video.created_at,
  is_liked: video.is_liked,
  likes: video.like_cnt,
  comment_count: video.comment_cnt,
  uploader: video.uploader
});

const normalizeCommentData = (comment, user) => {
    // LocalDateTime 객체를 ISO 문자열로 변환
    let createdAt = null;
    if (comment.created_at) {
      const dt = comment.created_at;
      createdAt = new Date(
        dt.year,
        dt.monthValue - 1, // JavaScript는 월이 0부터 시작
        dt.dayOfMonth,
        dt.hour,
        dt.minute,
        dt.second,
        Math.floor(dt.nano / 1000000) // nano -> milliseconds
      );
    }
    
    return {
      id: comment.sc_id,
      user: comment.user_name,
      user_id: comment.user_id,
      text: comment.comment,
      createdAt: createdAt || new Date(),
      isOwner : comment.user_id == user.user_id
    };
  };


// ========================================
// API 함수들
// ========================================

/**
 * 최초 진입 시 비디오 데이터 가져오기
 */
const fetchInitialVideos = async (userId) => {
  try {
    const { videos = [] } = await ApiClient.get('/api/shorts/initial', {
      params: { user_id: userId }
    });

    return { 
      videos: videos.map(normalizeVideoData) 
    };

  } catch (err) {
    console.error("fetchInitialVideos error:", err);
    return { videos: [] };
  }
};

/**
 * 다음 비디오 가져오기
 */
const fetchNextVideo = async (currentVideoId, userId) => {
  try {

    ApiClient.accessLog({
      user_id : userId,
      page : "SHORTSVIEWER"
    });


    const { video = null } = await ApiClient.get('/api/shorts/next', {
      params: {
        user_id: userId,
        current_video_id: currentVideoId,
      }
    });

    return { 
      video: video ? normalizeVideoData(video) : null 
    };

  } catch (err) {
    console.error("fetchNextVideo error:", err);
    return { video: null };
  }
};

/**
 * 좋아요 토글
 */
const toggleLikeAPI = async (videoId, userId, currentIsLiked) => {
  try {
    const { success, like_cnt, is_liked } = await ApiClient.postForm('/api/shorts/like/toggle', {
      video_id: videoId,
      user_id: userId
    });

    return {
      success: success !== false,
      new_like_count: like_cnt,
      is_liked: is_liked
    };

  } catch (err) {
    console.error("toggleLikeAPI error:", err);
    return {
      success: false,
      new_like_count: currentIsLiked ? -1 : 1,
      is_liked: currentIsLiked
    };
  }
};

/**
 * 댓글 목록 가져오기
 */
const fetchCommentsAPI = async (videoId, user) => {
  try {
    const { comments = [] } = await ApiClient.get('/api/shorts/comment/list', {
      params: { video_id: videoId }
    });
    return {
      comments: comments.map(comment => normalizeCommentData(comment, user))
    };

  } catch (err) {
    console.error("fetchCommentsAPI error:", err);
    return { comments: [] };
  }
};

/**
 * 댓글 추가
 */
const addCommentAPI = async (videoId, userId, commentText) => {
  try {
    const { success, comment } = await ApiClient.postForm('/api/shorts/comment/add', {
      video_id: videoId,
      user_id: userId,
      comment: commentText
    });

    const userDm = {
      user_id: userId
    };

    return {
      success: success !== false,
      comment: comment ? normalizeCommentData(comment, userDm) : null
    };

  } catch (err) {
    console.error("addCommentAPI error:", err);
    return {
      success: false,
      comment: null
    };
  }
};

const deleteCommentAPI = async (sc_id, userId) => {
  try {
    const { success } = await ApiClient.postForm('/api/shorts/comment/delete', {
      sc_id: sc_id,
      user_id: userId,
    });

    return { success: success !== false };
  } catch (err) {
    console.error("deleteCommentAPI error:", err);
    return { success: false };
  }
};


// ========================================
// 유틸리티 함수
// ========================================

// 시간 포맷 함수
const formatTime = (date) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}주 전`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}개월 전`;
  return `${Math.floor(diff / 31536000)}년 전`;
};

// 숫자 포맷 함수
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// ========================================
// 스타일 정의
// ========================================

const styles = {
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  swiper: {
    width: '100%',
    height: '100%',
  },
  slideContainer: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
    pointerEvents: 'none',
  },
  controlsContainer: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    display: 'flex',
    gap: '12px',
    zIndex: 20,
  },
  controlButton: {
    width: '44px',
    height: '44px',
    backgroundColor: 'rgba(0,0,0,0)',
    backdropFilter: 'blur(12px)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  controlButtonHover: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  rightActions: {
    position: 'absolute',
    right: '16px',
    bottom: '120px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    alignItems: 'center',
    zIndex: 20,
  },
  actionButton: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(0,0,0,0)',
    backdropFilter: 'blur(8px)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255,0,0,0.8)',
  },
  actionCount: {
    color: 'white',
    fontSize: '8px',
    fontWeight: '600',
    marginTop: '0px',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  },
  bottomInfo: {
    position: 'absolute',
    width: '70%',
    bottom: '100px',
    left: '16px',
    right: '16px',
    zIndex: 20,
  },
  uploaderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    cursor: 'pointer',
  },
  uploaderAvatar: {
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(12px)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    flexShrink: 0,
  },
  uploaderName: {
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  title: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    textShadow: '0 2px 8px rgba(0,0,0,0.7)',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: '90px',
    left: 0,
    right: 0,
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    cursor: 'pointer',
    zIndex: 30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ef4444',
    transition: 'width 0.1s',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-end',
    touchAction: 'none',
  },
  modalContent: {
    width: '100%',
    maxHeight: '70vh',
    backgroundColor: 'white',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '90px',
    touchAction: 'auto',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e5e5',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
  },
  commentItem: {
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f0f0f0',
  },
  commentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  commentHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  commentUser: {
    fontWeight: '600',
    fontSize: '12px',
    color: '#000',
  },
  commentTime: {
    fontSize: '11px',
    color: '#999',
  },
  commentMenuButton: {
    width: '24px',
    height: '24px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#666',
    padding: 0,
  },
  commentText: {
    fontSize: '12px',
    color: '#333',
    lineHeight: '1.5',
  },
  noComments: {
    textAlign: 'center',
    color: '#999',
    padding: '40px 20px',
    fontSize: '12px',
  },
  commentInputContainer: {
    padding: '12px 20px',
    borderTop: '1px solid #e5e5e5',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  commentInput: {
    flex: 1,
    padding: '10px 16px',
    border: '1px solid #e5e5e5',
    borderRadius: '20px',
    fontSize: '12px',
    outline: 'none',
  },
  sendButton: {
    width: '40px',
    height: '40px',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    flexShrink: 0,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
};

// ========================================
// 메인 컴포넌트
// ========================================

export default function ShortsViewer({ pageHistory, navigateToPageWithData, PAGES, goBack, showAdWithCallback }) {
  const videoRefs = useRef([]);
  const swiperRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  const { user, isActiveUser, iauMasking, filterFavorits } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();


  const deleteComment = async (comment) => {


    const result = await Swal.fire({
      title: get('shorts.comment.delete.confirm.title'),
      text: get('shorts.comment.delete.confirm.text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: get('Common.Delete'),
      cancelButtonText: get('Common.Cancel')
    });
  
    if (result.isConfirmed) {
      try {
        const { success } = await deleteCommentAPI(comment.id, comment.user_id);
        
        if (success) {
          // 1. 댓글 목록에서 제거
          setComments(prevComments => 
            prevComments.filter(c => c.id !== comment.id)
          );
          
          // 2. 비디오의 댓글 카운트 -1
          const currentVideo = videos[currentIndex];
          setVideos(prev => prev.map(v => 
            v.video_id === currentVideo.video_id 
              ? { ...v, comment_count: Math.max(0, v.comment_count - 1) } 
              : v
          ));
          
          Swal.fire(
            get('shorts.comment.delete.success.title'), 
            get('shorts.comment.delete.success.text'), 
            'success'
          );
        } else {
          Swal.fire(
            get('shorts.comment.delete.error.title'), 
            get('shorts.comment.delete.error.text'), 
            'error'
          );
        }
      } catch (error) {
        console.error('댓글 삭제 실패:', error);
        Swal.fire(
          get('shorts.comment.delete.error.title'), 
          get('shorts.comment.delete.error.text'), 
          'error'
        );
      }
    }
  };









  // 댓글 모달 열릴 때 스크롤 비활성화
  useEffect(() => {
    if (showCommentModal) {
      if (swiperRef.current) {
        swiperRef.current.disable();
        swiperRef.current.mousewheel.disable();
      }
      
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
        
        if (swiperRef.current) {
          swiperRef.current.enable();
          swiperRef.current.mousewheel.enable();
        }
      };
    }
  }, [showCommentModal]);

  // 초기 비디오 로드 및 첫 번째 비디오 자동 재생
  useEffect(() => {
    const loadInitialVideos = async () => {
      try {
        const { videos: initialVideos } = await fetchInitialVideos(user.user_id);
        setVideos(initialVideos);
        setLoading(false);
        
        setTimeout(() => {
          const firstVideo = videoRefs.current[0];
          if (firstVideo) {
            firstVideo.muted = false;
            setIsMuted(false);
            firstVideo.play()
              .then(() => {
                setIsPlaying(true);
                setUserInteracted(true);
              })
              .catch((err) => {
                console.log("Autoplay failed:", err);
                setIsPlaying(false);
              });
          }
        }, 100);
      } catch (error) {
        console.error('Failed to load initial videos:', error);
        setLoading(false);
      }
    };

    window.scrollTo(0, 0);

    loadInitialVideos();
  }, [user.user_id]);

  const preloadNextVideo = async (current_video_id) => {
    try {
      const { video } = await fetchNextVideo(current_video_id, user.user_id);
      if (video) {
        setVideos(prev => [...prev, video]);
      }
    } catch (error) {
      console.error('Failed to preload next video:', error);
    }
  };

  const shouldLoadVideo = (index) => {
    return Math.abs(index - currentIndex) <= 1;
  };

  useEffect(() => {
    if (videos.length === 0) return;
    
    const currentVideo = videoRefs.current[currentIndex];
    if (!currentVideo) return;

    const updateProgress = () => {
      const progress = (currentVideo.currentTime / currentVideo.duration) * 100;
      setProgress(progress);
    };

    currentVideo.addEventListener("timeupdate", updateProgress);
    return () => currentVideo.removeEventListener("timeupdate", updateProgress);
  }, [currentIndex, videos]);

  const handleSlideChange = (swiper) => {

    videoRefs.current.forEach((v) => {
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    });

    const newIndex = swiper.activeIndex;
    setCurrentIndex(newIndex);
    setProgress(0);
    setShowCommentModal(false);

    if (videos[newIndex]) {
      preloadNextVideo(videos[newIndex].video_id);
    }

    if (userInteracted) {
      const current = videoRefs.current[newIndex];
      if (current) {
        current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.log("Play failed:", err);
          setIsPlaying(false);
        });
      }
    }
  };

  const togglePlay = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (!currentVideo) return;

    if (!userInteracted) {
      setUserInteracted(true);
    }

    if (isPlaying) {
      currentVideo.pause();
      setIsPlaying(false);
    } else {
      currentVideo.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log("Play failed:", err);
      });
    }
  };

  const toggleMute = () => {
    if (!userInteracted) {
      setUserInteracted(true);
    }

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    videoRefs.current.forEach((v) => {
      if (v) v.muted = newMutedState;
    });
  };

  const handleProgressChange = (e) => {
    const currentVideo = videoRefs.current[currentIndex];
    if (!currentVideo) return;

    if (!userInteracted) {
      setUserInteracted(true);
    }

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    currentVideo.currentTime = percent * currentVideo.duration;
  };

  const handleUploaderClick = (venueId = -1) => {
    
    if(venueId < 0){
        // 매장 연결하지 않음
        return;
    }


    navigateToPageWithData(PAGES.DISCOVER, { venueId });
  };

  const handleVideoClick = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }
    togglePlay();
  };

  const toggleLike = async (video_id) => {
    const video = videos.find(v => v.video_id === video_id);
    if (!video) return;

    try {
      const { success, new_like_count, is_liked } = await toggleLikeAPI(
        video.video_id,
        user.user_id,
        video.is_liked
      );
      
      if (success) {
        setVideos(prev => prev.map(v => 
          v.video_id === video_id 
            ? { ...v, likes: new_like_count, is_liked } 
            : v
        ));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const openCommentModal = async (user) => {
    const currentVideo = videos[currentIndex];
    if (!currentVideo) return;


    
    try {
      const { comments: fetchedComments } = await fetchCommentsAPI(currentVideo.video_id, user);
      setComments(fetchedComments);
      setShowCommentModal(true);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setNewComment('');

    window.scrollTo(0, 0);
  };

  const addComment = async () => {
    if (newComment.trim() === '') return;
  
    const currentVideo = videos[currentIndex];
    if (!currentVideo) return;
  
    try {
      const { success, comment } = await addCommentAPI(
        currentVideo.video_id,
        user.user_id,
        newComment.trim()
      );
      
      if (success && comment) {
        // 1. 댓글 목록에 추가
        setComments(prev => [comment, ...prev]);
        
        // 2. 비디오의 댓글 카운트 +1
        setVideos(prev => prev.map(v => 
          v.video_id === currentVideo.video_id 
            ? { ...v, comment_count: v.comment_count + 1 } 
            : v
        ));
        
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleCommentMenu = (comment) => {
    console.log('댓글 메뉴 클릭:', comment);
    deleteComment(comment);

  };

  const handleModalOverlayTouchMove = (e) => {
    const modalContent = document.querySelector('.modal-content-wrapper');
    if (modalContent && modalContent.contains(e.target)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  if (loading) {
    return (
      <div style={{ 
        ...styles.container, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px'
      }}>
        Loading...
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div style={{ 
        ...styles.container, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px'
      }}>
        No videos available
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  return (
    <div style={styles.container}>
      <Swiper
        direction="vertical"
        mousewheel={true}
        modules={[Mousewheel]}
        onSlideChange={handleSlideChange}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        style={{
          ...styles.swiper,
          pointerEvents: showCommentModal ? 'none' : 'auto'
        }}
      >
        {videos.map((item, idx) => (
          <SwiperSlide key={item.video_id}>
            <div style={styles.slideContainer} onClick={handleVideoClick}>
              {shouldLoadVideo(idx) ? (
                <video
                  ref={(el) => (videoRefs.current[idx] = el)}
                  src={item.s_path}
                  style={styles.video}
                  playsInline
                  preload="metadata"
                  loop
                  muted={isMuted}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }} />
              )}

              <div style={styles.gradientOverlay} />

              {!isPlaying && idx === currentIndex && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 30,
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                  }}>
                    <Play style={{ width: '40px', height: '40px', color: 'white', marginLeft: '4px' }} fill="white" />
                  </div>
                </div>
              )}

              <div style={styles.controlsContainer}>
                <button
                  onClick={togglePlay}
                  onMouseEnter={() => setHoveredButton('play')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={{
                    display:'none',
                    /*
                    ...styles.controlButton,
                    ...(hoveredButton === 'play' ? styles.controlButtonHover : {}),
                    */
                  }}
                >
                  {isPlaying ? (
                    <Pause style={{ width: '24px', height: '24px', color: 'white' }} />
                  ) : (
                    <Play style={{ width: '24px', height: '24px', color: 'white' }} />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  onMouseEnter={() => setHoveredButton('mute')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={{
                    ...styles.controlButton,
                    ...(hoveredButton === 'mute' ? styles.controlButtonHover : {}),
                  }}
                >
                  {isMuted ? (
                    <VolumeX style={{ width: '24px', height: '24px', color: 'white' }} />
                  ) : (
                    <Volume2 style={{ width: '24px', height: '24px', color: 'white' }} />
                  )}
                </button>
              </div>

              {idx === currentIndex && (
                <div style={styles.rightActions}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item.video_id);
                      }}
                      style={{
                        ...styles.actionButton,
                        ...(item.is_liked ? styles.actionButtonActive : {}),
                      }}
                    >
                      <Heart
                        style={{ width: '28px', height: '28px', color: 'white' }}
                        fill={item.is_liked ? 'white' : 'none'}
                      />
                    </button>
                    <span style={styles.actionCount}>
                      {formatNumber(item.likes || 0)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCommentModal(user);
                      }}
                      style={styles.actionButton}
                    >
                      <MessageCircle style={{ width: '28px', height: '28px', color: 'white' }} />
                    </button>
                    <span style={styles.actionCount}>
                      {item.comment_count || 0}
                    </span>
                  </div>
                </div>
              )}

              <div style={styles.bottomInfo}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploaderClick(item.uploader.venue_id);
                  }}
                  style={styles.uploaderContainer}
                >
                  <div style={styles.uploaderAvatar}>
                    {item.uploader.venue_id < 0 
                        ? '🤠' 
                        : item.uploader.name.substring(0, 1)
                    }
                  </div>
                  <span style={styles.uploaderName}>
                    {item.uploader.name}
                  </span>
                </div>

                <h2 style={styles.title}>{item.title}</h2>
              </div>

              <div
                style={styles.progressBarContainer}
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgressChange(e);
                }}
              >
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {showCommentModal && currentVideo && (
        <div
          style={styles.modalOverlay}
          onTouchMove={handleModalOverlayTouchMove}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeCommentModal();
            }
          }}
        >
          <div 
            className="modal-content-wrapper"
            style={styles.modalContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                댓글 {comments.length}개
              </h3>
              <button onClick={closeCommentModal} style={styles.closeButton}>
                <X style={{ width: '24px', height: '24px', color: '#000' }} />
              </button>
            </div>

            <div style={styles.commentsList}>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} style={styles.commentItem}>
                    <div style={styles.commentHeader}>
                      <div style={styles.commentHeaderLeft}>
                        <span style={styles.commentUser}>{comment.user}</span>
                        <span style={styles.commentTime}>{formatTime(comment.createdAt)}</span>
                      </div>
                      {comment.isOwner && (
                        <button 
                          onClick={() => handleCommentMenu(comment)}
                          style={styles.commentMenuButton}
                        >
                          x
                        </button>
                      )}
                    </div>
                    
                    <div style={styles.commentText}>
                      {comment.text}
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.noComments}>
                  첫 번째 댓글을 남겨보세요!
                </div>
              )}
            </div>

            <div style={styles.commentInputContainer}>
              <input
                type="text"
                placeholder="댓글을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addComment();
                  }
                }}
                style={styles.commentInput}
              />
              <button
                onClick={addComment}
                disabled={newComment.trim() === ''}
                style={{
                  ...styles.sendButton,
                  ...(newComment.trim() === '' ? styles.sendButtonDisabled : {}),
                }}
              >
                <Send style={{ width: '20px', height: '20px', color: 'white' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}