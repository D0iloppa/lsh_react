import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Pencil, Trash2 } from "lucide-react";

import SketchBtn from "@components/SketchBtn";
import ApiClient from "@utils/ApiClient";

const MenuItemManage = ({ venue_id, get }) => {
  const [items, setItems] = useState([]);

  // ✅ 공통 Swal Form
  const openMenuForm = async (title, defaultValues = {}) => {
    const { value: formValues } = await Swal.fire({
      title,
      html: `
        <div class="swal-form-row">
          <label for="swal-name">${get("menu.mng.input.name") || "코스명"}</label>
          <input id="swal-name" class="swal2-input-inline" value="${defaultValues.name || ""}">
        </div>
        <div class="swal-form-row">
          <label for="swal-price">${get("menu.mng.input.price") || "가격"}</label>
          <div class="swal-price-wrap">
            <input id="swal-price" class="swal2-input-inline" 
                 value="${defaultValues.price ? new Intl.NumberFormat("vi-VN").format(defaultValues.price) : ""}" 
                 type="text">
          </div>
        </div>
        <div class="swal-form-row">
          <label for="swal-duration">${get("menu.mng.input.duration") || "이용시간"}</label>
          <div class="swal-duration-wrap">
            <input id="swal-duration" class="swal2-input-inline" value="${defaultValues.duration || ""}" type="number">
          </div>
        </div>
        <div class="swal-form-row">
          <label for="swal-desc">${get("menu.mng.input.description") || "설명"}</label>
          <textarea id="swal-desc" class="swal2-textarea-inline">${defaultValues.description || ""}</textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: get("menu.mng.button.save") || "저장",
      cancelButtonText: get("menu.mng.button.cancel") || "취소",
      preConfirm: () => {
            const name = document.getElementById("swal-name").value.trim();
            const price = document.getElementById("swal-price").value.replace(/\./g, "").trim();
            const duration = document.getElementById("swal-duration").value.trim();
            const description = document.getElementById("swal-desc").value.trim();

            if (!name) {
                Swal.showValidationMessage(get('ERR_MENU_NAME_REQUIRED') || "코스명을 입력해주세요");
                return false;
            }
            if (!price) {
                Swal.showValidationMessage(get('ERR_MENU_PRICE_REQUIRED') || "가격을 입력해주세요");
                return false;
            }
            if (!description) {
                Swal.showValidationMessage(get('ERR_MENU_DESC_REQUIRED') || "설명을 입력해주세요");
                return false;
            }

            return { name, price, duration, description };
        },
      didOpen: () => {
        // ✅ 팝업 내부 스타일
        const style = document.createElement("style");
        style.innerHTML = `
          .swal2-popup {
            max-width: 90%;
          }
          .swal-form-row {
            display: flex;
            align-items: center;
            margin: 20px 0;
            gap: 10px;
          }
          .swal-form-row label {
            flex: 0 0 60px;
            font-size: 13px;
            text-align: right;
          }
          .swal2-input-inline {
            flex: 1;
            margin: 0 !important;
            height: 30px;
            font-size: 14px;
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px solid #ccc;
          }
          .swal2-textarea-inline {
            flex: 1;
            margin: 0 !important;
            font-size: 14px;
            padding: 6px 8px;
            height: 70px;
            resize: vertical;
            border-radius: 6px;
            border: 1px solid #ccc;
          }
          .swal-price-wrap {
            position: relative;
            flex: 1;
          }
          .swal-price-wrap input {
            width: 92%;
          }
          .swal-price-wrap::after {
            content: "VND";
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 13px;
            color: #666;
          }

          .swal-duration-wrap {
            position: relative;
            flex: 1;
          }
          .swal-duration-wrap input {
            width: 92%;
          }

          .swal-duration-wrap::after {
            content: "min";
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 13px;
            color: #666;
          }

            div:where(.swal2-container).swal2-center>.swal2-popup{width:100%; max-width:100%;}

            div:where(.swal2-container) h2:where(.swal2-title){
              border-bottom: 1px solid #d2d2d2;
              padding-bottom: 1rem;
            }
        `;
        Swal.getPopup().appendChild(style);

        const priceInput = document.getElementById("swal-price");
        priceInput.addEventListener("input", (e) => {
          let value = e.target.value.replace(/[^\d]/g, "");
          if (!value) {
            e.target.value = "";
            return;
          }
          e.target.value = new Intl.NumberFormat("vi-VN").format(value);
        });
      },
    });

    return formValues;
  };

  // ✅ 코스 목록 가져오기
  const fetchMenuList = async () => {
    try {
      const res = await ApiClient.postForm("/api/getMenuItemList", {
        venue_id: venue_id,
      });
      setItems(res.data || []); // 서버에서 내려온 목록 반영
    } catch (err) {
      console.error("코스 목록 조회 실패:", err);
    }
  };

  // ✅ 마운트 시 코스 목록 불러오기
  useEffect(() => {
    fetchMenuList();
  }, [venue_id]);

  // ✅ 코스 추가
  const handleAdd = async () => {
    const formValues = await openMenuForm(get("menu.mng.dialog.add") || "코스 추가");
    if (formValues && formValues.name) {
      const newItem = {
        venue_id,
        ...formValues,
        type: "menu_item",
        mode: "insert",
      };

      try {
        const res = await ApiClient.postForm("/api/menuItemMng", newItem);
        if (res.success) {
          // 새로고침 대신 목록 다시 조회
          fetchMenuList();
        }
      } catch (err) {
        console.error("코스 추가 실패:", err);
      }
    }
  };

  // ✅ 코스 수정
  const handleEdit = async (id) => {
    const item = items.find((i) => i.item_id === id || i.temp_id === id);
    if (!item) return;

    const formValues = await openMenuForm(get("menu.mng.dialog.edit") || "코스 수정", item);
    if (formValues) {
      const payload = {
        item_id: item.item_id,
        venue_id,
        ...formValues,
        type: "menu_item",
        mode: "update",
      };

      try {
        const res = await ApiClient.postForm("/api/menuItemMng", payload);
        if (res.success) {
          fetchMenuList();
        }
      } catch (err) {
        console.error("코스 수정 실패:", err);
      }
    }
  };

  // ✅ 코스 삭제
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: get("menu.mng.confirm.delete") || "삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: get("menu.mng.button.delete") || "삭제",
      cancelButtonText: get("menu.mng.button.cancel") || "취소",
    });

    if (result.isConfirmed) {
      const item = items.find((i) => i.item_id === id || i.temp_id === id);
      if (!item?.item_id) {
        setItems(items.filter((i) => i.temp_id !== id));
        return;
      }

      const payload = {
        item_id: item.item_id,
        venue_id,
        mode: "delete",
      };

      try {
        const res = await ApiClient.postForm("/api/menuItemMng", payload);
        if (res.success) {
          fetchMenuList();
        }
      } catch (err) {
        console.error("코스 삭제 실패:", err);
      }
    }
  };

  return (
    <div className="menu-item-manage">
      <SketchBtn className="add-btn" onClick={handleAdd}>
        {get("menu.mng.button.add") || "+ 코스 추가"}
      </SketchBtn>

      <ul className="menu-list">
        {items.map((item) => (
          <li key={item.item_id || item.temp_id} className="menu-item">
            <div className="menu-info">
              <strong>{item.name}</strong> -{" "}
              {Number(item.price).toLocaleString("vi-VN")} VND
              <div className="menu-desc">{item.description}</div>
            </div>
            <div className="menu-actions">
              <button
                className="icon-btn"
                onClick={() => handleEdit(item.item_id || item.temp_id)}
              >
                <Pencil size={18} />
              </button>
              <button
                className="icon-btn"
                onClick={() => handleDelete(item.item_id || item.temp_id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* styled-jsx */}
      <style jsx>{`
        .add-btn {
          font-size: 0.9rem;
          padding: 6px 12px;
          margin-bottom: 10px;
        }
        .menu-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .menu-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ddd;
          padding: 8px 0;
        }
        .menu-info {
          flex: 1;
        }
        .menu-desc {
          font-size: 0.85rem;
          color: #666;
          white-space: pre-line;
        }
        .menu-actions {
          display: flex;
          gap: 8px;
        }
        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover {
          color: #0070f3;
        }
      `}</style>
    </div>
  );
};

export default MenuItemManage;
