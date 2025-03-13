import { Icon } from "lucide-react";
import { tennisBall } from "@lucide/lab";

export const TennisBall: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} iconNode={tennisBall} />
);
