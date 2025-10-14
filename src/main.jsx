import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@ant-design/v5-patch-for-react-19';
import './styles/index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Cấu hình redux
import { Provider } from "react-redux";
import { store, persistor } from "@/redux/store";
// Redux Persist - LocalStorage
import { PersistGate } from "redux-persist/integration/react";
import { NotificationProvider } from "@/contexts/NotificationContext";

const queryClient = new QueryClient();
createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </PersistGate>
    </Provider>
  </QueryClientProvider>,
)
