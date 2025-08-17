import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "@/redux/slices/authSlice";


// Cấu hình Redux Persist 
const persistConfig = {
    key: "root",
    version: 1,
    storage,
    whitelist: ["auth"],
};
// Gộp reducer với persistReducer chỉ cho orderReducer
const rootReducer = combineReducers({
    auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Bỏ kiểm tra serializable để tránh lỗi
        }),
});

export const persistor = persistStore(store);
