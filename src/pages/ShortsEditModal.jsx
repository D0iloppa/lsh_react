import React, { useState } from 'react';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';

const ShortsEditModal = ({ isOpen, onClose, shorts, onSaved }) => {

  const [title, setTitle] = useState(shorts.title);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setLoading(true);

      await ApiClient.postForm('/api/shorts/editShorts', {
        shorts_id: shorts.shorts_id,
        title
      });

      Swal.fire("수정 완료!", "", "success");
      onSaved?.();
      onClose();

    } catch (err) {
      Swal.fire("수정 실패", "", "error");
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

          <div style={{ fontWeight:700, marginBottom:'1rem' }}>쇼츠 수정</div>

          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            style={{ width:'100%', padding:'0.5rem', border:'1px solid #ccc', borderRadius:'6px', marginTop:'6px', marginBottom:'1rem' }}
          />

          <div style={{ display:'flex', gap:'10px' }}>
            <SketchBtn variant="secondary" onClick={onClose} disabled={loading}>취소</SketchBtn>

            <SketchBtn variant="primary" onClick={handleSave} disabled={loading}>
              {loading ? "저장 중..." : "저장"}
            </SketchBtn>
          </div>

        </SketchDiv>
      </div>
    </>
  );
};

export default ShortsEditModal;
