import Badge from "../common/Badge";
import { statusBadgeTone } from "../../utils/statusFlow";

export default function StatusBadge({ status }) {
  return <Badge tone={statusBadgeTone(status)}>{status}</Badge>;
}
