import Badge from "@/components/ui/Badge";
import { BOOKING_STATUS_META } from "@/lib/utils";
import { BookingStatus } from "@/types";

interface Props {
  status: BookingStatus;
}

export default function BookingStatusBadge({ status }: Props) {
  const { label, colour } = BOOKING_STATUS_META[status];
  return <Badge className={colour}>{label}</Badge>;
}
