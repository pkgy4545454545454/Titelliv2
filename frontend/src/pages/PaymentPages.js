import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { paymentAPI } from '../services/api';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const checkPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }

      let attempts = 0;
      const maxAttempts = 5;
      const pollInterval = 2000;

      const poll = async () => {
        try {
          const response = await paymentAPI.getStatus(sessionId);
          setPaymentData(response.data);

          if (response.data.payment_status === 'paid') {
            setStatus('success');
            return;
          } else if (response.data.status === 'expired') {
            setStatus('error');
            return;
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, pollInterval);
          } else {
            setStatus('pending');
          }
        } catch (error) {
          console.error('Error checking payment:', error);
          setStatus('error');
        }
      };

      poll();
    };

    checkPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center px-4" data-testid="payment-success-page">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="card-service rounded-2xl p-12">
            <Loader2 className="w-16 h-16 text-[#0047AB] mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Vérification du paiement...
            </h1>
            <p className="text-gray-400">Veuillez patienter pendant que nous vérifions votre paiement.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="card-service rounded-2xl p-12">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Paiement réussi !
            </h1>
            <p className="text-gray-400 mb-8">
              Merci pour votre paiement de {paymentData?.amount_total ? (paymentData.amount_total / 100).toFixed(2) : '0.00'} {paymentData?.currency?.toUpperCase() || 'CHF'}.
            </p>
            <div className="space-y-3">
              <Link to="/dashboard/entreprise" className="btn-primary w-full block">
                Retour au tableau de bord
              </Link>
              <Link to="/" className="btn-secondary w-full block">
                Continuer à explorer
              </Link>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="card-service rounded-2xl p-12">
            <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Paiement en cours de traitement
            </h1>
            <p className="text-gray-400 mb-8">
              Votre paiement est en cours de traitement. Vous recevrez une confirmation par email.
            </p>
            <Link to="/" className="btn-primary w-full block">
              Retour à l'accueil
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="card-service rounded-2xl p-12">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Paiement échoué
            </h1>
            <p className="text-gray-400 mb-8">
              Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.
            </p>
            <div className="space-y-3">
              <Link to="/dashboard/entreprise" className="btn-primary w-full block">
                Réessayer
              </Link>
              <Link to="/" className="btn-secondary w-full block">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentCancelPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center px-4" data-testid="payment-cancel-page">
      <div className="max-w-md w-full text-center card-service rounded-2xl p-12">
        <div className="w-20 h-20 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Paiement annulé
        </h1>
        <p className="text-gray-400 mb-8">
          Vous avez annulé le paiement. Aucun montant n'a été débité.
        </p>
        <div className="space-y-3">
          <Link to="/dashboard/entreprise" className="btn-primary w-full block">
            Retour au tableau de bord
          </Link>
          <Link to="/" className="btn-secondary w-full block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export { PaymentSuccessPage, PaymentCancelPage };
