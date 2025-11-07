
import { useState } from 'react';
import { Image, Typography, Space} from 'antd';
import ButtonCompoent from '@/components/ButtonComponent/ButtonComponent';
import DrawerComponent from '@/components/DrawerComponent/DrawerComponent';
import { FilePdfOutlined } from '@ant-design/icons';
const { Title } = Typography;
const AttachmentsSection = ({attachments,twoLevel}) => {
    const [openPdf, setOpenPdf] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState(null);
    if (!attachments || attachments.length === 0) {
        return "Chưa cập nhật";
    }
     // Tách file PDF và ảnh
    const imageFiles = attachments.filter(
        (f) =>
        f.toLowerCase().endsWith(".jpg") ||
        f.toLowerCase().endsWith(".jpeg") ||
        f.toLowerCase().endsWith(".png") ||
        f.toLowerCase().endsWith(".gif") ||
        f.toLowerCase().endsWith(".webp")
    );

    const pdfFiles = attachments.filter((f) => f.toLowerCase().endsWith(".pdf"));
    const handleViewPDF = (file) => {
        setSelectedPdf(`${import.meta.env.VITE_APP_BACKEND_URL}${file}`);
        setOpenPdf(true);
    };
    return (
        <>
            {imageFiles.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Title level={5}>Hình ảnh:</Title>
                    {imageFiles.map((file, index) => (
                        <Image.PreviewGroup key={file}>
                            <Image
                                src={`${import.meta.env.VITE_APP_BACKEND_URL}${file}`}
                                alt={`Attachment ${index + 1}`}
                                width={120}
                                height={120}
                                style={{ borderRadius: 8, objectFit: "cover" }}
                            />
                        </Image.PreviewGroup>
                    ))}
                </div>
        
            )}
            {pdfFiles.length > 0 && (
                <Space direction="vertical" style={{ marginBottom: 16 }}>
                    <Title level={5}>File PDF:</Title>
                    {pdfFiles.map((file, index) => (
                        <ButtonCompoent
                            type="primary"
                            key={file}
                            ghost
                            icon={<FilePdfOutlined size={30} style={{color:'red', fontSize: '24px'}}/>}
                            onClick={() => handleViewPDF(file)}
                        >
                            {`Xem file PDF ${index + 1}`}
                        </ButtonCompoent>
                    ))}
                </Space>
            )}
            <DrawerComponent
                title="Xem file PDF"
                onClose={() => setOpenPdf(false)}
                getContainer={ twoLevel ? false : undefined }
                width="80%"
                open={openPdf}
                style={{ position: "absolute" }} // 🔥 Giúp Drawer con nằm đúng vị trí
            >
                {selectedPdf && (
                    <iframe
                        src={selectedPdf}
                        width="100%"
                        height="600px"
                        style={{ border: "none" }}
                    />
                )}
            </DrawerComponent>
        </>
    );
}

export default AttachmentsSection