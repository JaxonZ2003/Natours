/* eslint-disable */
const stripe = Stripe(
  'pk_test_51PAHwBKXRKhZUYBu3zUlNd8mFu3rh9PjpYY5OLwFwSmaDGwvndHAjRQzvbQwwvgLTKCXEHmrvRjaxwTWmtgCD2ir00xh0Ooq6P',
);

import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
