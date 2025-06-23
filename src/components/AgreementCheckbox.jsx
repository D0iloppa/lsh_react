import React from 'react';
import { useMsg } from '@contexts/MsgContext';

const AgreementCheckbox = ({ 
  agreements, 
  onAgreementChange, 
  className = '',
  showRequired = true 
}) => {
  const { get } = useMsg();

  const agreementItems = [
    {
      key: 'allTerms',
      labelKey: 'Reservation.agree',
      required: true
    },
    {
      key: 'ageConfirm',
      labelKey: 'reservation.agreement.age.confirm',
      required: false
    },
    {
      key: 'personalInfo',
      labelKey: 'reservation.agreement.personal.info',
      required: false
    },
    {
      key: 'thirdParty',
      labelKey: 'reservation.agreement.third.party',
      required: false
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

        .agreement-label.all-terms {
          font-weight: 600;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .agreement-label.all-terms:hover {
          background-color: #f1f5f9;
        }

        .individual-agreements {
          margin-left: 1rem;
          padding-left: 0.5rem;
          border-left: 2px solid #e5e7eb;
        }

        @media (max-width: 480px) {
          .agreement-container {
            font-size: 0.85rem;
          }
          
          .individual-agreements {
            margin-left: 0.5rem;
          }
        }
      `}</style>

      <div className={`agreement-container ${className}`}>
        {/* 전체 동의 */}
        <label className="agreement-label all-terms">
          <input 
            type="checkbox" 
            checked={agreements.allTerms}
            onChange={(e) => onAgreementChange('allTerms', e.target.checked)}
            className="agreement-checkbox"
          />
          <span className="agreement-text">
            {get('Reservation.agree')}
            {showRequired && <span className="required-mark">*</span>}
          </span>
        </label>

        {/* 개별 동의 항목들 */}
        <div className="individual-agreements">
          {agreementItems.slice(1).map((item) => (
            <label key={item.key} className="agreement-label">
              <input 
                type="checkbox" 
                checked={agreements[item.key]}
                onChange={(e) => onAgreementChange(item.key, e.target.checked)}
                className="agreement-checkbox"
              />
              <span className="agreement-text">
                {get(item.labelKey)}
              </span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
};

export default AgreementCheckbox;