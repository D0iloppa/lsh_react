// src/debug/PageView.jsx
import React from 'react'
import { useParams } from 'react-router-dom'

import WelcomePage from '@components/Welcome'
import LoginView from '@components/Login'
import RegisterView from '@components/Register'

import HomePage from '@pages/HomePage'
import DiscoverPage from '@pages/DiscoverPage'
import StaffDetailPage from '@pages/StaffDetailPage'

import ReservationPage from '@pages/ReservationPage'
import ReservationSummaryPage from '@pages/ReservationSummaryPage'
import SubscriptionPaymentPage from '@pages/SubscriptionPaymentPage'

import ShareExpPage from '@pages/ShareExpPage'
import SearchPage from '@pages/SearchPage'
import EventListPage from '@pages/EventListPage'
import AccountPage from '@pages/AccountPage'
import MapPage from '@pages/MapPage'

import ViewReview from '@pages/ViewReview'
import Notifications from '@pages/Notifications'
import CSPage1 from '@pages/CSPage1'
import CSPage2 from '@pages/CSPage2'

import Promotion from '@pages/Promotion'
import BookingHistory from '@pages/BookingHistory'
import Favorites from '@pages/Favorites'
import Setting from '@pages/Setting'

const COMPONENT_MAP = {
  welcome: <WelcomePage />,
  login: <LoginView />,
  register: <RegisterView />,

  home: <HomePage />,
  discover: <DiscoverPage />,
  staff: <StaffDetailPage />,

  reservation: <ReservationPage />,
  reservationSummary: <ReservationSummaryPage />,
  subscription: <SubscriptionPaymentPage />,

  share: <ShareExpPage />,
  search: <SearchPage />,
  events: <EventListPage />,
  account: <AccountPage />,
  map: <MapPage />,

  review: <ViewReview />,
  notifications: <Notifications />,

  cs1: <CSPage1 />,
  cs2: <CSPage2 />,

  promo: <Promotion />,
  history: <BookingHistory />,
  favorites: <Favorites />,
  setting: <Setting />
}

export default function PageView() {
  const { id } = useParams()
  const component = COMPONENT_MAP[id]

  return (
    <div style={{ padding: 20 }}>
      <h2>🚧 테스트 뷰: <code>{id}</code></h2>
      {component ? component : (
        <p style={{ color: 'red' }}>
          ⚠️ 해당 테스트 컴포넌트 <b>{id}</b>는 존재하지 않습니다.
        </p>
      )}
    </div>
  )
}