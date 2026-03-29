import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackScreenView } from '../../services/telemetry';

function RouteTelemetry() {
  const location = useLocation();

  useEffect(() => {
    trackScreenView(location.pathname, document.title);
  }, [location.pathname]);

  return null;
}

export default RouteTelemetry;
