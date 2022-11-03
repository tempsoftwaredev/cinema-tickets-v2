# Instructions

Set up your environment and install the required dependencies:

```
nvm use
npm i
```

Test the `TicketService` through `jest`

```
npm run test
```

or through (a pre-loaded) Node REPL:

```
npm run repl

# Example:
# create two adult tickets
# and purchase and reserve those ticket

const tickets = new ticket('ADULT', 2);
service.purchaseTickets(1, tickets);
```

# Original Task

## Business Rules

- There are 3 types of tickets i.e. Infant, Child, and Adult.
- The ticket prices are based on the type of ticket (see table below).
- The ticket purchaser declares how many and what type of tickets they want to buy.
- Multiple tickets can be purchased at any given time.
- Only a maximum of 20 tickets that can be purchased at a time.
- Infants do not pay for a ticket and are not allocated a seat. They will be sitting on an Adult's lap.
- Child and Infant tickets cannot be purchased without purchasing an Adult ticket.

| Ticket Type | Price |
| ----------- | ----- |
| INFANT      | £0    |
| CHILD       | £10   |
| ADULT       | £20   |

- There is an existing `TicketPaymentService` responsible for taking payments.
- There is an existing `SeatReservationService` responsible for reserving seats.

### Constraints

- The JavaScript code in the `thirdparty` folder CANNOT be modified.
- The `TicketTypeRequest` SHOULD be an immutable object.

### Assumptions

You can assume:

- All accounts with an id greater than zero are valid. They also have sufficient funds to pay for any no of tickets.
- The `TicketPaymentService` implementation is an external provider with no defects. You do not need to worry about how the actual payment happens.
- The payment will always go through once a payment request has been made to the `TicketPaymentService`.
- The `SeatReservationService` implementation is an external provider with no defects. You do not need to worry about how the seat reservation algorithm works.
- The seat will always be reserved once a reservation request has been made to the `SeatReservationService`.

### Your Task

Provide a working implementation of a `TicketService` that:

- Considers the above objective, business rules, constraints & assumptions.
- Calculates the correct amount for the requested tickets and makes a payment request to the `TicketPaymentService`.
- Calculates the correct no of seats to reserve and makes a seat reservation request to the `SeatReservationService`.
- Rejects any invalid ticket purchase requests. It is up to you to identify what should be deemed as an invalid purchase request.
