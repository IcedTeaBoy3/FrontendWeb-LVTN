import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@ant-design/v5-patch-for-react-19";
import "./styles/index.css";

import App from "./App.jsx";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Redux + Persist
import { Provider } from "react-redux";
import { store, persistor } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";

// Context
import { NotificationProvider } from "@/contexts/NotificationContext";

// Ant Design + tiếng Việt
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";

// ✅ Thiết lập ngôn ngữ mặc định cho dayjs
dayjs.locale("vi");

// Khởi tạo React Query Client
const queryClient = new QueryClient();

// Render
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider locale={viVN}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>
);
