import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import TicketService from "../src/pairtest/TicketService";
import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService";
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService";
import { errorSpy } from "./testUtil";

describe("TicketTypeRequest", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("constructor", () => {
    it("should not allow invalid ticket types", () => {
      const result = new errorSpy(
        () => new TicketTypeRequest("WRONG_TYPE", 1)
      ).run();

      expect(result).toBeInstanceOf(TypeError);
      expect(result.message).toEqual("type must be ADULT, CHILD, or INFANT");
    });

    it("should not allow negative ticket numbers", () => {
      const result = new errorSpy(
        () => new TicketTypeRequest("ADULT", 0)
      ).run();

      expect(result).toBeInstanceOf(TypeError);
      expect(result.message).toEqual("noOfTickets must be a positive integer");
    });
  });

  describe("getNoOfTickets", () => {
    it("should return the number of tickets", () => {
      const amount = 32;
      const ticket = new TicketTypeRequest("ADULT", amount);

      const result = ticket.getNoOfTickets();

      expect(result).toBe(amount);
    });
  });

  describe("getTicketType", () => {
    it("should return the type of the ticket", () => {
      const type = "INFANT";
      const ticket = new TicketTypeRequest(type, 32);

      const result = ticket.getTicketType();

      expect(result).toEqual(type);
    });
  });

  describe("getTicketTypes", () => {
    it("should return the possible types for a ticket", () => {
      const result = TicketTypeRequest.getTicketTypes();

      expect(result).toEqual(["ADULT", "CHILD", "INFANT"]);
    });
  });
});
