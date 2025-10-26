import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/components/ParticipantEdit.css";
import PageHeader from "./PageHeader";

const ICONS = {
  back: "/assets/figma/ad1574d39b9fb9ce8f54df3a503c66ff4915d4c8.svg",
  bell: "/assets/figma/9dfac8e7468229fa02b7e41911b2430638cc8d70.svg",
  avatar: "/assets/figma/1d5ad8aaf12fd61a75197f707f6ef40c7edd6e1f.png",
  user: "/assets/figma/daa5ccd28610285fd14bfcff2d13b6a1f794a45a.svg",
  ticket: "/assets/figma/867a83dc4a4ce89b14f7494744651a6091538bae.svg",
  credit: "/assets/figma/6cc16e8a3d5249d45f23c6f0a43215a98c413c96.svg",
  mascot: "/assets/figma/a4d344160c76ced3ded807c9dfb9564210221c59.svg",
  scissor: "/assets/figma/aa9de78b2c4be9b33c039338f289ec7dc3663d95.svg",
  minus: "/assets/figma/8a68699b303eb1dab10adad80f33f24e06f22814.svg",
  plus: "/assets/figma/c40671971a66d3ee273776075aab31bcf1d83fcc.svg",
  save: "/assets/figma/99a258c8b2f0ac266e31ffa8159bd4f8c2717525.svg",
};

const ParticipantEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="participant-edit-page">
      <PageHeader title="참가자 정보 수정" subtitle="참가자의 게임 정보를 수정하고 관리하세요" />

      <main className="edit-content">
        {/* 기본 정보 */}
        <section className="section basic-info">
          <div className="section-title">
            <div className="title-icon gradient">
              <img src={ICONS.user} alt="사용자" />
            </div>
            <div className="title-text">
              <h2>기본 정보</h2>
              <p>참가자의 기본 정보를 확인하고 수정하세요</p>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>참가자 이름</label>
              <div className="input-with-icon">
                <input type="text" defaultValue="김철수" />
                <img src={ICONS.user} alt="이름" />
              </div>
            </div>
            <div className="form-group">
              <label>티켓 수</label>
              <div className="input-with-icon">
                <input type="number" defaultValue={15} />
                <img src={ICONS.ticket} alt="티켓" />
              </div>
            </div>
            <div className="form-group full">
              <label>크레딧</label>
              <div className="input-with-icon">
                <input type="number" defaultValue={2500} />
                <img src={ICONS.credit} alt="크레딧" />
              </div>
            </div>
          </div>
        </section>

        {/* 옷 키우기 */}
        <section className="section grow-info">
          <div className="section-title">
            <div className="title-icon gradient alt">
              <img src={ICONS.mascot} alt="마스코트" />
            </div>
            <div className="title-text">
              <h2>옷 키우기 (마스코트)</h2>
              <p>마스코트의 성장 정보를 관리하세요</p>
            </div>
          </div>

          <div className="card inline">
            <div className="tool">
              <div className="tool-icon">
                <img src={ICONS.scissor} alt="가위" />
              </div>
              <div className="tool-text">
                <h3>마법의 가위</h3>
                <p>마스코트 레벨업 도구</p>
              </div>
              <div className="tool-count">
                <strong>23개</strong>
                <span>보유 수량</span>
              </div>
            </div>
            <div className="tool-adjust">
              <label>수량 조정:</label>
              <div className="adjust-controls">
                <button className="btn minus" type="button" aria-label="감소">
                  <img src={ICONS.minus} alt="감소" />
                </button>
                <input type="number" defaultValue={23} />
                <button className="btn plus" type="button" aria-label="증가">
                  <img src={ICONS.plus} alt="증가" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="actions">
          <button className="save-btn">
            <img src={ICONS.save} alt="저장" />
            저장하기
          </button>
        </div>
      </main>
    </div>
  );
};

export default ParticipantEdit;


