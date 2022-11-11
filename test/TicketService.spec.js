import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import TicketService from "../src/pairtest/TicketService";
import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService";
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService";
import { errorSpy } from "./testUtil";

describe("TicketService", () => {
  const paymentService = new TicketPaymentService();
  const seatService = new SeatReservationService();
  const pricing = {
    INFANT: 0,
    CHILD: 1000,
    ADULT: 2000,
  };
  const maxTickets = 20;
  const ticketService = new TicketService(
    paymentService,
    seatService,
    pricing,
    20
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("constructor", () => {
    it("should require a price for all ticket types", () => {
      const incompletePricing = {
        INFANT: 0,
        ADULT: 2000,
      };

      const result = new errorSpy(
        () =>
          new TicketService(paymentService, seatService, incompletePricing, 20)
      ).run();

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toEqual("No pricing provided for CHILD");
    });

    it("should require a non-negative for all ticket types", () => {
      const invalidPricing = {
        INFANT: 0,
        CHILD: 0,
        ADULT: -200,
      };

      const result = new errorSpy(
        () => new TicketService(paymentService, seatService, invalidPricing, 20)
      ).run();

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toEqual(
        "Pricing for ADULT must be a positive integer (provide it in pence/cents)"
      );
    });
  });

  describe("purchaseTickets", () => {
    it("should accept multiple tickets of different types", () => {
      const tickets = [
        new TicketTypeRequest("ADULT", 1),
        new TicketTypeRequest("CHILD", 2),
        new TicketTypeRequest("INFANT", 3),
      ];
      const accountId = "1";

      const result = ticketService.purchaseTickets(accountId, ...tickets);

      expect(result).toBe(true);
    });

    it(`should not allow more than ${maxTickets} tickets to be purchased`, () => {
      const tickets = new TicketTypeRequest("ADULT", 21);
      const accountId = "1";

      const result = new errorSpy(() =>
        ticketService.purchaseTickets(accountId, tickets)
      ).run();

      expect(result).toBeInstanceOf(InvalidPurchaseException);
      expect(result.message).toEqual("ticket-service.too-many-tickets");
    });

    it(`should not allow more than ${maxTickets} tickets to be purchased, across ticket types`, () => {
      const tickets = [
        new TicketTypeRequest("ADULT", 10),
        new TicketTypeRequest("CHILD", 10),
        new TicketTypeRequest("INFANT", 1),
      ];
      const accountId = "1";

      const result = new errorSpy(() =>
        ticketService.purchaseTickets(accountId, ...tickets)
      ).run();

      expect(result).toBeInstanceOf(InvalidPurchaseException);
      expect(result.message).toEqual("ticket-service.too-many-tickets");
    });

    it("should expect at least one ticket", () => {
      const accountId = "1";

      const result = new errorSpy(() =>
        ticketService.purchaseTickets(accountId)
      ).run();

      expect(result).toBeInstanceOf(InvalidPurchaseException);
      expect(result.message).toEqual("ticket-service.no-tickets-provided");
    });

    it("should abort if a non-ticket is provided", () => {
      const accountId = "1";

      const tickets = [
        new TicketTypeRequest("ADULT", 10),
        "notATicket",
        new TicketTypeRequest("INFANT", 1),
      ];

      const result = new errorSpy(() =>
        ticketService.purchaseTickets(accountId, tickets)
      ).run();

      expect(result).toBeInstanceOf(InvalidPurchaseException);
      expect(result.message).toEqual("ticket-service.invalid-tickets");
    });

    it("should not allow child tickets without an adult ticket", () => {
      const tickets = new TicketTypeRequest("CHILD", 1);
      const accountId = "1";

      const result = new errorSpy(() =>
        ticketService.purchaseTickets(accountId, tickets)
      ).run();

      expect(result).toBeInstanceOf(InvalidPurchaseException);
      expect(result.message).toEqual("ticket-service.missing-adult-ticket");
    });

    it("should not allow infant tickets without an adult ticket", () => {
      const tickets = new TicketTypeRequest("INFANT", 1);
      const accountId = "1";

      const result = new errorSpy(() =>
        ticketService.purchaseTickets(accountId, tickets)
      ).run();

      expect(result).toBeInstanceOf(InvalidPurchaseException);
      expect(result.message).toEqual("ticket-service.missing-adult-ticket");
    });

    it("should not reserve seats for infant tickets", () => {
      const tickets = [
        new TicketTypeRequest("ADULT", 5),
        new TicketTypeRequest("CHILD", 6),
        new TicketTypeRequest("INFANT", 3),
      ];
      const accountId = "1";

      const spy = jest.spyOn(seatService, "reserveSeat");

      const result = ticketService.purchaseTickets(accountId, ...tickets);

      expect(spy).toHaveBeenCalledWith(Number(accountId), 11);
    });

    it("should charge the appropriate price for each ticket", () => {
      const ticketSetup = [
        ["ADULT", 5],
        ["CHILD", 6],
        ["INFANT", 3],
      ];
      const expectedPrice = 16000; // 5 * 2000 + 6 * 1000 + 3 * 0
      const tickets = ticketSetup.map(
        ([type, amount]) => new TicketTypeRequest(type, amount)
      );
      const accountId = "1";

      const spy = jest.spyOn(paymentService, "makePayment");

      const result = ticketService.purchaseTickets(accountId, ...tickets);

      expect(spy).toHaveBeenCalledWith(Number(accountId), expectedPrice);
      expect(result).toBe(true);
    });

    it.each([
      ["1", true],
      ["1337", true],
      ["-1", false],
      ["0", false],
      ["12345A", false],
      ["A", false],
      [1, true],
      [1337, true],
      [-1, false],
      [0, false],
    ])(
      "should catch invalid account IDs. %p is valid: %p ",
      (accountId, expected) => {
        const tickets = new TicketTypeRequest("ADULT", 1);
        const result = new errorSpy(() =>
          ticketService.purchaseTickets(accountId, tickets)
        ).run();

        if (!expected) {
          expect(result).toBeInstanceOf(InvalidPurchaseException);
          expect(result.message).toEqual("ticket-service.invalid-account-id");
        } else expect(result).toEqual(true);
      }
    );
  });
});
