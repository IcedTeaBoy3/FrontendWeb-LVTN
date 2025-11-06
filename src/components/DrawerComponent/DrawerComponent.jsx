import { StyledDrawer } from "./style"
const DrawerComponent = ({
    title = "Drawer",
    placement = "right",
    children,
    isOpen = false,
    ...rests
}) => {
    return (
        <StyledDrawer 
            title={title} 
            open={isOpen} 
            placement={placement} 
            closable={{ placement: 'end' }}
            {...rests}
           
        >
            {children}
        </StyledDrawer>
    );
};

export default DrawerComponent;
