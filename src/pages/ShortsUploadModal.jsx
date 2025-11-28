import React, { useState } from 'react';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';
import { useAuth } from '@contexts/AuthContext';

const ShortsUploadModal = ({ isOpen, onClose, onUploaded }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null; // overlay-kit 방식의 기본

  const handleUpload = async () => {
    if (!title.trim()) {
      Swal.fire("제목을 입력해줘!", "", "warning");
      return;
    }
    if (!file) {
      Swal.fire("동영상 파일을 선택해줘!", "", "warning");
      return;
    }

    try {
      setLoading(true);

      const resp = await ApiClient.uploadShorts({
        file,
        owner_id: user.venue_id,
        title
      });

      if (resp?.success) {
        Swal.fire("업로드 완료!", "", "success");
        onUploaded?.();
        onClose();
      } else {
        Swal.fire("업로드 실패", resp?.error || "", "error");
      }

    } catch (e) {
      Swal.fire("에러 발생", String(e), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx="true">{`
        .ok-backdrop {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .ok-modal {
          width: 90%;
          max-width: 22rem;
          background: #fff;
          border-radius: 12px;
          padding: 1.2rem;
          position: relative;
          box-shadow: 0 4px 25px rgba(0,0,0,0.25);
        }
      `}</style>

      <div className="ok-backdrop" onClick={onClose}>
        <SketchDiv className="ok-modal" onClick={(e)=>e.stopPropagation()}>
          <HatchPattern opacity={0.3} />

          <div style={{ fontWeight:700, marginBottom:'1rem' }}>쇼츠 업로드</div>

          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            style={{ width:'100%', padding:'0.5rem', border:'1px solid #ccc', borderRadius:'6px', marginTop:'6px', marginBottom:'1rem' }}
          />

          <label>동영상 파일</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e)=>setFile(e.target.files[0])}
            style={{ marginTop:'6px', marginBottom:'1rem' }}
          />

          <div style={{ display:'flex', gap:'10px' }}>
            <SketchBtn variant="secondary" onClick={onClose} disabled={loading}>취소</SketchBtn>
            <SketchBtn variant="primary" onClick={handleUpload} disabled={loading}>
              {loading ? "업로드 중..." : "업로드"}
            </SketchBtn>
          </div>

        </SketchDiv>
      </div>
    </>
  );
};

export default ShortsUploadModal;
