import React, { useState, useEffect } from 'react'; 
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeader';

const SubscriptionPaymentPage = ({ 
  navigateToPageWithData, 
  PAGES, 
  ...otherProps 
}) => {
  const [subscriptionType, setSubscriptionType] = useState('subscription');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleProfile = () => {
    console.log('Profile 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.PROFILE);
  };

  const handleSubscriptionTypeChange = (type) => {
    setSubscriptionType(type);
  };

  const handleConfirmPay = () => {
    const paymentData = {
      subscriptionType,
      startDate,
      duration,
      cardNumber,
      nameOnCard,
      expiryDate,
      cvv
    };
    console.log('Payment confirmed:', paymentData);
    navigateToPageWithData && navigateToPageWithData(PAGES.SHARE_EXP, { paymentSuccess: true });
  };

   useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <>
      <style jsx>{`
        .payment-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
          position: relative;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
        }

        .logo {
          
          font-weight: bold;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .profile-icon {
          width: 2rem;
          height: 2rem;
          border: 2px solid #1f2937;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background-color: white;
          font-size: 1.2rem;
        }

        .content-section {
          padding: 1.5rem;
        }

        .section {
          margin-bottom: 2rem;
        }

        .section-title {
          
          font-size: 1.1rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .subscription-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 0;
        }

        .subscription-tabs .sketch-btn {
          flex: 1;
          border-radius: 0;
          margin: 0;
        }

        .subscription-tabs .sketch-btn:first-child {
          border-right: 1px solid #1f2937;
        }

        .form-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .form-row .sketch-input {
          flex: 1;
        }

        .form-field {
          margin-bottom: 1rem;
        }

        .duration-select {
          height: 50px;
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #1f2937;
          border-top-left-radius: 6px 8px;
           border-top-right-radius: 10px 5px;
           border-bottom-right-radius: 8px 12px;
           border-bottom-left-radius: 12px 6px;
          background-color: white;
          cursor: pointer;
          transform: rotate(-0.2deg);

          font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
        }

        .confirm-section {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
        }

        @media (max-width: 480px) {
          .payment-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }

          .confirm-section {
            position: relative;
            bottom: auto;
            right: auto;
            margin-top: 2rem;
            text-align: center;
          }
        }

        .no-rotate{border-radius: 5px !important;}
      `}</style>

      <div className="payment-container">
        {/* Header */}
       
                <SketchHeader
                  title={'Confirm reservation'}
                  showBack={true}
                  onBack={() => console.log('뒤로가기')}
                  rightButtons={[]}
                />
        {/* <div className="header">
          <div className="logo">🍸 LeTanTon Sheriff</div>
          <div className="profile-icon" onClick={handleProfile}>
            👤
          </div>
        </div> */}

        {/* Content Section */}
        <div className="content-section">
          {/* Select Subscription Type */}
          <div className="section">
            <div className="section-title">Select Subscription Type</div>
            <div className="subscription-tabs">
              <SketchBtn
                variant={subscriptionType === 'subscription' ? 'primary' : 'secondary'}
                size="medium"
                className="no-rotate"
                onClick={() => handleSubscriptionTypeChange('subscription')}
              >
                Subscription
              </SketchBtn>
              <SketchBtn
                variant={subscriptionType === 'ticket' ? 'primary' : 'secondary'}
                size="medium"
                className="no-rotate"
                onClick={() => handleSubscriptionTypeChange('ticket')}
              >
                One-Day Ticket
              </SketchBtn>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="section">
            <div className="section-title">Subscription Details</div>
            
            <div className="form-field">
              <SketchInput
                type="text"
                placeholder="Enter Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <select 
                className="duration-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="">Duration (Days)</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="365">365 Days</option>
              </select>
            </div>
          </div>

          {/* Payment Information */}
          <div className="section" style={{marginBottom: '0px'}}>
            <div className="section-title">Payment Information</div>
            
            <div className="form-field">
              <SketchInput
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>

            <div className="form-field">
              <SketchInput
                type="text"
                placeholder="Name on Card"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
              />
            </div>

            <div className="form-row">
              <SketchInput
                type="text"
                placeholder="Expiry Date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
              <SketchInput
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Confirm Section */}
        {/* <div className="full-width" style={{paddingBottom: '20px'}}>
          <SketchBtn 
            onClick={handleConfirmPay}
          >
            Confirm & Pay
            <HatchPattern opacity={0.4} />
          </SketchBtn>
        </div> */}
        <div style={{padding: '20px'}}>
        <SketchBtn 
          className="full-width" style={{paddingBottom: '20px'}}
          variant="event" 
          size="normal"
          onClick={handleConfirmPay}
        >
          Confirm & Pay
          <HatchPattern opacity={0.8} />
        </SketchBtn>
      </div></div>
    </>
  );
};

export default SubscriptionPaymentPage;