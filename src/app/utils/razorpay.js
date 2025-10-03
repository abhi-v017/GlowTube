// Razorpay utility functions for frontend integration

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createSubscription = async (planKey, userToken) => {
  try {
    // Call your backend to create subscription
    const response = await fetch(`http://localhost:5000/api/v1/payments/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ planKey })
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }

    const data = await response.json();
    return data.data.subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const handleRazorpayPayment = async (subscriptionId, userEmail, userName) => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    throw new Error('Razorpay SDK failed to load');
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subscription_id: subscriptionId,
      name: 'AI Thumbnail Generator',
      description: 'Pro Plan Subscription',
      image: '/logo.png',
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: '#3B82F6'
      },
      handler: function (response) {
        console.log('Payment successful:', response);
        resolve(response);
      },
      modal: {
        ondismiss: function() {
          reject(new Error('Payment cancelled'));
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  });
};

export const getPlanDetails = (planId) => {
  const plans = {
    'pro': {
      name: 'Pro Plan',
      price: 99,
      credits: 100,
      features: [
        '100 AI generations per month',
        'Premium thumbnail generation',
        'Advanced description generation',
        'Priority support'
      ]
    },
    'agency': {
      name: 'Agency Plan',
      price: 999,
      credits: 500,
      features: [
        '500 AI generations per month',
        'All Pro features',
        'White-label solution',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ]
    }
  };

  return plans[planId] || null;
};

// Map app-level plan keys to Razorpay plan_id values from env
// No longer needed on frontend. Backend maps planKey -> plan_id.