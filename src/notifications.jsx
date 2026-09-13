import {Alert} from '@mui/material';
import {ToastContainer, toast} from 'react-toastify';

export const notificationContent =
    (severity, text) =>
    ({closeToast}) => (
        <Alert elevation={6} variant="filled" onClose={() => closeToast(true)} severity={severity}>
            {text}
        </Alert>
    );

export const notify = (severity, text, options) => toast(notificationContent(severity, text), options);

export function Notifications() {
    return (
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            draggable={false}
            closeButton={false}
            rtl={false}
            pauseOnFocusLoss={false}
            toastClassName="dashboard-toast"
            ariaLabel="Dashboard notifications"
        />
    );
}
