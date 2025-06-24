import React from 'react';
import { useMsg } from '@contexts/MsgContext';

const AgreementCheckbox2 = ({ 
  agreements, 
  onAgreementChange, 
  className = '',
  showRequired = true 
}) => {
  const { get } = useMsg();

  const agreementItems = [
    {
      key: 'policyTerms',
      labelKey: 'Agreement.PolicyText',
      required: true
    }
  ];

  return (
    <>
      <style jsx="true">{`
        .agreement-container {
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .agreement-label {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          padding: 0.25rem;
          border-radius: 4px;
        }

        .agreement-label:hover {
          background-color: #f9fafb;
        }

        .agreement-checkbox {
          margin-right: 0.5rem;
          margin-top: 0.2rem;
          min-width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .agreement-text {
          flex: 1;
          user-select: none;
        }

        .required-mark {
          color: #ef4444;
          font-weight: bold;
          margin-left: 2px;
        }

        .agreement-label.policy-terms {
          font-weight: 600;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .agreement-label.policy-terms:hover {
          background-color: #f1f5f9;
        }

        .policy-content {
          margin-left: 1rem;
          padding: 1rem;
          background-color: #fafafa;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          max-height: 200px;
          overflow-y: auto;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        .policy-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
          font-size: 0.85rem;
        }

        .policy-section {
          margin-bottom: 1rem;
        }

        .policy-section:last-child {
          margin-bottom: 0;
        }

        .policy-subtitle {
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 0.5rem;
          font-size: 0.8rem;
        }

        .policy-text {
          color: #6b7280;
          margin-bottom: 0.4rem;
        }

        .policy-list {
          padding-left: 1rem;
          margin: 0.5rem 0;
        }

        .policy-list li {
          margin-bottom: 0.25rem;
          color: #6b7280;
        }

        @media (max-width: 480px) {
          .agreement-container {
            font-size: 0.85rem;
          }
          
          .policy-content {
            margin-left: 0.5rem;
            padding: 0.75rem;
            max-height: 150px;
          }
        }
      `}</style>

      <div className={`agreement-container ${className}`}>
        {/* 정책 동의 */}
        <label className="agreement-label policy-terms">
          <input 
            type="checkbox" 
            checked={agreements.policyTerms}
            onChange={(e) => onAgreementChange('policyTerms', e.target.checked)}
            className="agreement-checkbox"
          />
          <span className="agreement-text">
            {get('Agreement.PolicyText') || '다음의 이용 정책들에 대해 동의합니다.'}
            {showRequired && <span className="required-mark">*</span>}
          </span>
        </label>

        {/* 정책 내용 */}
        <div className="policy-content">
            <div className="policy-title">
                {get('Agreement.CancelRefundPolicy') || '취소 / 환불 / 노쇼 정책'}
            </div>
            
            <div className="policy-section">
                <div className="policy-subtitle">{get('Policy.Cancel.Title')}</div>
                <div className="policy-text">{get('Policy.Cancel.Description')}</div>
                <ul className="policy-list">
                <li>{get('Policy.Cancel.7Days')}</li>
                <li>{get('Policy.Cancel.3to6Days')}</li>
                <li>{get('Policy.Cancel.1to2Days')}</li>
                <li>{get('Policy.Cancel.SameDay')}</li>
                </ul>
            </div>

            <div className="policy-section">
                <div className="policy-subtitle">{get('Policy.Refund.Title')}</div>
                <div className="policy-text">{get('Policy.Refund.Processing')}</div>
                <div className="policy-text">{get('Policy.Refund.Partial')}</div>
            </div>

            <div className="policy-section">
                <div className="policy-subtitle">{get('Policy.NoShow.Title')}</div>
                <div className="policy-text">{get('Policy.NoShow.Rule')}</div>
                <div className="policy-text">{get('Policy.NoShow.Consequence')}</div>
            </div>
        </div>

      </div>
    </>
  );
};

export default AgreementCheckbox2;