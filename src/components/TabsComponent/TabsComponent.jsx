
import { CustomTabs } from "./style";
const TabsComponent = ({ items, onChange, ...rests }) => {
    return <CustomTabs items={items} onChange={onChange} {...rests} />;
};

export default TabsComponent;
