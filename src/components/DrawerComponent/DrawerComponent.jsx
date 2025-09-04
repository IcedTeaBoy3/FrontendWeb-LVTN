import { StyledDrawer } from "./style"
const DrawerComponent = ({
    title = "Drawer",
    placement = "right",
    children,
    isOpen = false,
    ...rests
}) => {
    return (
        <StyledDrawer title={title} open={isOpen} placement={placement} {...rests}>
            {children}
        </StyledDrawer>
    );
};

export default DrawerComponent;
