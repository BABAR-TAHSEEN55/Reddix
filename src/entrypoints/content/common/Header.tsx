
import { Button } from "@/components/ui/button";

interface HeaderProps {
	onRemove: () => void;
}
const Header = ({ onRemove }: HeaderProps) => {
	return (
		<div>
			<Button onClick={onRemove}>Close</Button>
		</div>
	);
};

export default Header;
