import repl from "repl";
import TicketService from "./src/pairtest/TicketService.js";
import TicketTypeRequest from "./src/pairtest/lib/TicketTypeRequest.js";
import TicketPaymentService from "./src/thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "./src/thirdparty/seatbooking/SeatReservationService.js";

const service = new TicketService(
  new TicketPaymentService(),
  new SeatReservationService(),
  {
    INFANT: 0,
    CHILD: 1000,
    ADULT: 2000,
  },
  20
);

const replSession = repl.start();
replSession.context.service = service;
replSession.context.ticket = TicketTypeRequest;
