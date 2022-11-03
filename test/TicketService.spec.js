import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import TicketService from "../src/pairtest/TicketService";
import { errorSpy } from "./testUtil";

describe("TicketService", () => {
  const ticketService = new TicketService();

  it("should not allow more than 20 tickets to be purchased", () => {
    const tickets = new TicketTypeRequest("ADULT", 21);
    const accountId = "1";

    const result = new errorSpy(() =>
      ticketService.purchaseTickets(accountId, tickets)
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
      const result = new errorSpy(() =>
        ticketService.purchaseTickets(accountId)
      ).run();

      if (!expected) {
        expect(result).toBeInstanceOf(InvalidPurchaseException);
        expect(result.message).toEqual("ticket-service.invalid-account-id");
      } else expect(result).toEqual(true);
    }
  );
});
