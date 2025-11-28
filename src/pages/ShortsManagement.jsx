import React, { useEffect, useState } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import { Film } from 'lucide-react';

import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';
import { useAuth } from '@contexts/AuthContext';

// ===============================
// 공통 모달 Wrapper
// ===============================
const ModalContainer = ({ children, onClose }) => {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {children}
        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
          <button style={closeBtn} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

// ===============================
// 쇼츠 업로드 모달
// ===============================
const ShortsUploadModal = ({ onClose, onUploaded, venueId }) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!title || !file) {
      Swal.fire("제목과 파일을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("onwer_id", venueId);

    try {
      await ApiClient.post('/api/shorts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Swal.fire("업로드 완료!", "", "success");
      onUploaded();
      onClose();
    } catch (e) {
      Swal.fire("업로드 실패", "", "error");
    }
  };

  return (
    <ModalContainer onClose={onClose}>
      <h3 style={modalTitle}>쇼츠 업로드</h3>

      <input 
        type="text" 
        placeholder="제목 입력"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
        style={inputStyle}
      />
      
      <input 
        type="file"
        accept="video/*"
        onChange={(e)=>setFile(e.target.files[0])}
        style={inputStyle}
      />

      <button onClick={handleUpload} style={confirmBtn}>업로드</button>
    </ModalContainer>
  );
};

// ===============================
// 쇼츠 수정 모달
// ===============================
const ShortsEditModal = ({ onClose, onSaved, shorts }) => {
  const [title, setTitle] = useState(shorts.title);

  const handleSave = async () => {
    try {
      await ApiClient.postForm('/api/shorts/editShorts', {
        shorts_id: shorts.shorts_id,
        title
      });

      Swal.fire("수정 완료", "", "success");
      onSaved();
      onClose();
    } catch (e) {
      Swal.fire("수정 실패", "", "error");
    }
  };

  return (
    <ModalContainer onClose={onClose}>
      <h3 style={modalTitle}>쇼츠 수정</h3>

      <input 
        type="text"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
        style={inputStyle}
      />

      <button onClick={handleSave} style={confirmBtn}>저장</button>
    </ModalContainer>
  );
};

// ===============================
// 영상 재생 모달
// ===============================
const ShortsVideoViewer = ({ onClose, videoUrl, title }) => {
  return (
    <ModalContainer onClose={onClose}>
      <h3 style={modalTitle}>{title}</h3>

      <video 
        src={videoUrl}
        controls
        autoPlay
        style={{
          width: '100%',
          maxHeight: '60vh',
          borderRadius: '10px',
          marginTop: '0.5rem',
          background: '#000'
        }}
      />

    </ModalContainer>
  );
};

// ===============================
// 메인 페이지
// ===============================

const ShortsManagement = ({ navigateToPageWithData, PAGES, goBack, showAdWithCallback, ...otherProps }) => {

  const { user } = useAuth();
  const venueId = user?.venue_id;

  const [shortsList, setShortsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [viewVideo, setViewVideo] = useState(null);


  // StaffManagement와 동일 날짜 스타일
  const formatDate = (obj) => {
    if (!obj) return "-";
    const m = String(obj.monthValue).padStart(2,'0');
    const d = String(obj.dayOfMonth).padStart(2,'0');
    const h = String(obj.hour).padStart(2,'0');
    const mi = String(obj.minute).padStart(2,'0');
    return `${obj.year}-${m}-${d} ${h}:${mi}`;
  };

  const loadShortsList = async () => {
    if (!venueId) return;
    setLoading(true);

    try {
      const res = await ApiClient.get('/api/shorts/getShortsList', {
        params: { owner_id: venueId }
      });


      const {prefix, root} = res; 
      
      let shortList = (res?.data || []).map(item => {
        if (item.s_path) {
          return {
            ...item,
            s_path: item.s_path.replace(root, prefix)
          };
        }
        return item;
      });

      console.log(prefix, root, shortList);

      setShortsList(shortList);
    } catch {
      Swal.fire("리스트 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShortsList();
  }, [venueId]);


  // 삭제
  const handleDelete = async (shorts) => {
    const confirm = await Swal.fire({
      title: "삭제할까요?",
      text: shorts.title,
      showCancelButton: true
    });
    if (!confirm.isConfirmed) return;

    await ApiClient.postForm('/api/shorts/deleteShorts', {
      shorts_id: shorts.shorts_id
    });

    Swal.fire("삭제 완료!");
    loadShortsList();
  };


  return (
    <div className="shorts-container">

      <style jsx="true">{`
        .shorts-container {
          max-width: 28rem;
          margin-bottom: 1rem;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          padding: 1rem;
        }
        .shorts-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .shorts-card {
          position: relative;
          background: #fff;
          padding: 0.7rem 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }
        .shorts-img {
          width: 70px;
          height: 70px;
          background: #f3f4f6;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.1rem;
          color: #bbb;
          overflow: hidden;
        }
        .shorts-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
        }
        .shorts-info {
          flex: 1;
          margin-top: 2rem;
          max-width: 140px;
        }
        .shorts-title {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.1rem;
        }
        .shorts-date {
          font-size: 0.75rem;
          color: #666;
        }
      `}</style>

      <SketchHeader 
        title={<span style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <Film size={18}/> Shorts Management
        </span>}
        onBack={goBack}
        showBack={true}
      />

      <div style={{ display:'flex', justifyContent:'flex-end', margin:'0.8rem 0 1rem' }}>
        <SketchBtn 
          variant="primary" 
          size="medium"
          style={{padding:'0.75rem 1rem', fontSize:'14px'}}
          onClick={() => setShowUpload(true)}
        >
          + 쇼츠 추가
          <HatchPattern opacity={0.8} />
        </SketchBtn>
      </div>

      {/* 리스트 */}
      {loading ? (
        <div style={{textAlign:'center', padding:'2rem'}}>불러오는 중...</div>
      ) : (
        <div className="shorts-list">
          {shortsList.map(shorts => (
            <SketchDiv key={shorts.shorts_id} className="shorts-card">
              <HatchPattern opacity={0.4} />

              <div className="shorts-img">
                {shorts.thumbnail_url ? (
                  <img src={shorts.thumbnail_url} alt={shorts.title} />
                ) : (
                  <span>🎬</span>
                )}
              </div>

              <div className="shorts-info">
                <div className="shorts-title">{shorts.title}</div>
                <div className="shorts-date">{formatDate(shorts.created_at)}</div>
              </div>

              <div style={{
                position:'absolute',
                top:'8px',
                right:'8px',
                display:'flex',
                gap:'4px'
              }}>
                <button 
                    style={actionBtn} 
                    onClick={() =>
                      setViewVideo({
                        url: shorts.s_path,   // 이미 prefix로 변환된 최종 URL
                        title: shorts.title
                      })
                    }
                  >
                  보기
                </button>
                <button style={actionBtn} onClick={()=>setEditTarget(shorts)}>
                  수정
                </button>
                <button 
                  style={{...actionBtn, color:'#ef4444', borderColor:'#ef4444'}}
                  onClick={()=>handleDelete(shorts)}
                >
                  삭제
                </button>
              </div>

            </SketchDiv>
          ))}
        </div>
      )}

    {viewVideo && (
      <ShortsVideoViewer
        videoUrl={viewVideo.url}
        title={viewVideo.title}
        onClose={() => setViewVideo(null)}
      />
    )}

      {/* 업로드 모달 */}
      {showUpload && (
        <ShortsUploadModal
          venueId={venueId}
          onClose={()=>setShowUpload(false)}
          onUploaded={loadShortsList}
        />
      )}

      {/* 수정 모달 */}
      {editTarget && (
        <ShortsEditModal
          shorts={editTarget}
          onClose={()=>setEditTarget(null)}
          onSaved={loadShortsList}
        />
      )}

    </div>
  );
};


// ===============================
// 스타일
// ===============================

const actionBtn = {
  padding:'4px 8px',
  border:'1px solid #e5e7eb',
  borderRadius:'6px',
  background:'transparent',
  fontSize:'12px',
  cursor:'pointer',
  color:'#6b7280',
};

const overlayStyle = {
  position:'fixed',
  top:0, left:0, right:0, bottom:0,
  background:'rgba(0,0,0,0.35)',
  display:'flex',
  alignItems:'center',
  justifyContent:'center',
  zIndex:9999,
};

const modalStyle = {
  width:'85%',
  maxWidth:'350px',
  background:'white',
  borderRadius:'12px',
  padding:'1.2rem',
  position:'relative',
  boxShadow:'0 4px 20px rgba(0,0,0,0.25)',
};

const modalTitle = {
  fontSize:'1rem',
  fontWeight:'600',
  marginBottom:'1rem',
};

const closeBtn = {
  padding:'8px 16px',
  background:'#9ca3af',
  color:'white',
  border:'none',
  borderRadius:'8px',
  cursor:'pointer',
};

const confirmBtn = {
  padding:'8px 16px',
  width:'100%',
  background:'#10b981',
  color:'white',
  border:'none',
  borderRadius:'8px',
  cursor:'pointer',
  marginTop:'10px',
};

const inputStyle = {
  width:'100%',
  padding:'8px',
  margin:'8px 0',
  border:'1px solid #ddd',
  borderRadius:'6px'
};

export default ShortsManagement;
