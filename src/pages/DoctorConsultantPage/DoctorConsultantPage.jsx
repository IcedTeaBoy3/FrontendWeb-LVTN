import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Button, Card, Row, Col, Space, Typography } from "antd";
import { AudioMutedOutlined, AudioOutlined, PhoneOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import AgoraService from "@/services/AgoraService";
import * as Message from "@/components/Message/Message";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;

const DoctorConsultantPage = () => {
    const client = useRef(AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));
    const [localTracks, setLocalTracks] = useState([]);
    const [isMicOn, setIsMicOn] = useState(true);
    const [joined, setJoined] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const location = useLocation();
    const appointmentCode = location?.state?.appointmentCode;

    // GET TOKEN
    const queryGetToken = useQuery({
        queryKey: ["get-agora-token"],
        queryFn: () => AgoraService.getAgoraToken(appointmentCode),
        enabled: !!appointmentCode,
    });

    const { data: agoraData, isLoading: isLoadingToken } = queryGetToken;

    // 🔥 MIC TOGGLE
    const toggleMic = async () => {
        const audioTrack = localTracks[0];
        if (!audioTrack) return;

        const newState = !isMicOn;
        await audioTrack.setEnabled(newState);
        setIsMicOn(newState);

        Message.info(newState ? "Đã bật mic" : "Đã tắt mic");
    };

    // 🔥 JOIN ROOM
    const startCall = async () => {
        if (isLoadingToken || !agoraData?.data) return;

        const { token, uid } = agoraData.data;

        try {
            await client.current.join(
                import.meta.env.VITE_APP_AGORA_APP_ID,
                appointmentCode,
                token,
                uid
            );

            const mic = await AgoraRTC.createMicrophoneAudioTrack();
            const camera = await AgoraRTC.createCameraVideoTrack();

            // Play local video
            camera.play(localVideoRef.current);

            await client.current.publish([mic, camera]);
            setLocalTracks([mic, camera]);

            setJoined(true);
            Message.success("Tham gia phòng thành công");
        } catch (error) {
            console.error(error);
            Message.error("Không thể tham gia phòng");
        }
    };

    // 🔥 REMOTE USER PUBLISH
    const handleUserPublished = async (user, mediaType) => {
        await client.current.subscribe(user, mediaType);

        if (mediaType === "video") {
            remoteVideoRef.current.innerHTML = "";
            user.videoTrack.play(remoteVideoRef.current);
        }

        if (mediaType === "audio") {
            user.audioTrack.play();
        }
    };

    // 🔥 USER LEFT
    const handleUserLeft = () => {
        remoteVideoRef.current.innerHTML = "";
    };

    // CLEAN EVENTS
    useEffect(() => {
        client.current.on("user-published", handleUserPublished);
        client.current.on("user-left", handleUserLeft);

        return () => {
            client.current.off("user-published", handleUserPublished);
            client.current.off("user-left", handleUserLeft);
        };
    }, []);

    // 🔥 LEAVE ROOM
    const leaveCall = async () => {
        localTracks.forEach((track) => {
            track.stop();
            track.close();
        });

        await client.current.leave();
        setJoined(false);

        Message.success("Đã thoát phòng");
    };

    return (
        <Card style={{ width: "100%", padding: 20 }}>
            <Title level={3}>Tư vấn trực tuyến qua Video</Title>
            <Text type="secondary">Mã cuộc hẹn: {appointmentCode}</Text>

            {/* VIDEO AREA */}
            <Row gutter={20} style={{ marginTop: 20 }}>
                {/* LOCAL */}
                <Col span={12}>
                    <Card title="Bác sĩ (Bạn)" bodyStyle={{ padding: 0 }}>
                        <div
                            ref={localVideoRef}
                            style={{
                                width: "100%",
                                height: 400,
                                background: "#000",
                                borderRadius: 10,
                                overflow: "hidden",
                                position: "relative",
                            }}
                        />
                    </Card>
                </Col>

                {/* REMOTE */}
                <Col span={12}>
                    <Card title="Bệnh nhân" bodyStyle={{ padding: 0 }}>
                        <div
                            ref={remoteVideoRef}
                            style={{
                                width: "100%",
                                height: 400,
                                background: "#000",
                                borderRadius: 10,
                                overflow: "hidden",
                                position: "relative",
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* CONTROL BUTTONS */}
            <Space style={{ marginTop: 20 }}>
                {!joined ? (
                    <Button
                        type="primary"
                        size="large"
                        icon={<VideoCameraOutlined />}
                        onClick={startCall}
                    >
                        Bắt đầu tư vấn
                    </Button>
                ) : (
                    <>
                        <Button
                            type={isMicOn ? "default" : "primary"}
                            danger={!isMicOn}
                            size="large"
                            icon={isMicOn ? <AudioMutedOutlined /> : <AudioOutlined />}
                            onClick={toggleMic}
                        >
                            {isMicOn ? "Tắt Mic" : "Mở Mic"}
                        </Button>

                        <Button
                            danger
                            size="large"
                            icon={<PhoneOutlined />}
                            onClick={leaveCall}
                        >
                            Thoát
                        </Button>
                    </>
                )}
            </Space>
        </Card>
    );
};

export default DoctorConsultantPage;
