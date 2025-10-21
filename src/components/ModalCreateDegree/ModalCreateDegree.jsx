import ModalComponent from '@/components/ModalComponent/ModalComponent';
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import { Form, Input } from 'antd';
const ModalCreateDegree = ({formCreate,isPendingCreate, isModalOpenCreate, handleCreateDegree, handleCloseCreateDegree}) => {
    return (
        <LoadingComponent isLoading={isPendingCreate}>
            <ModalComponent
                title="Thêm mới học vị"
                open={isModalOpenCreate}
                onOk={handleCreateDegree}
                onCancel={handleCloseCreateDegree}
                width={600}
                cancelText="Huỷ"
                okText="Thêm"
                style={{ borderRadius: 0 }}
            >
                <Form
                    name="formCreate"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    style={{ maxWidth: 600, padding: "20px" }}
                    initialValues={{ remember: true }}
                    autoComplete="off"
                    form={formCreate}
                >
                    <Form.Item
                        label="Tên học vị"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên!",
                            },
                        ]}
                    >
                        <Input
                            name="title"
                            placeholder="Nhập vào tên chức vụ"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Viết tắt"
                        name="abbreviation"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên viết tắt!",
                            },
                        ]}
                    >
                        <Input
                            name="abbreviation"
                            placeholder="Nhập vào tên viết tắt"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Mô tả"
                        name="description"

                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập mô tả chi tiết tại đây..."
                        />
                    </Form.Item>
                </Form>
            </ModalComponent>
        </LoadingComponent>
  )
}

export default ModalCreateDegree