import styled from "styled-components";
import { Button } from "antd";
export const CustomButton = styled(Button)`
    font-weight: ${({$isSelected}) => ($isSelected ? "bold" : "500")};;
`;
