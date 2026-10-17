# Product Requirements Document (PRD)

## Service Request Management System

**Status:** Working specification. Verify requirements against the
latest source code and tests before treating this as a release
acceptance record.

## 1. Purpose

Provide a centralized system where customers create and track service
requests, a manager assigns technicians, and technicians accept and
complete work.

## 2. Goals

1.  Let customers create and manage their own requests.
2.  Let a manager review requests and assign technicians.
3.  Let technicians accept assignments and update progress.
4.  Reveal technician contact details after acceptance, according to the
    product rule.
5.  Enforce business rules in the backend.
6.  Provide a project that can be demonstrated and maintained by another
    developer.

## 3. User roles

### Customer

-   Register and log in.
-   Create service requests with required details.
-   View their own requests and request details.
-   Edit or delete eligible requests within the configured first 20
    minutes.
-   View technician contact details after the relevant technician
    accepts.
-   Access service history, notifications, and feedback where
    implemented.
-   Must not access another customer's private requests.

### Technician

-   Log in and view assigned requests.
-   Accept eligible assignments.
-   Update work status to in-progress and completed.
-   Manage profile details.
-   Must not update work they are not authorized to handle.

### Manager

-   View and manage requests, customers, and technicians.
-   Assign one or more technicians to a request.
-   View reports and dashboard information where implemented.

Business constraints established for the project: - Maximum of six
active technicians, if enabled in the current backend. - Assignment is
blocked until 30 minutes after request creation, if this remains the
configured rule. - Only one manager account is allowed, if enabled.
Duplicate-manager warning: `⚠️ There is a one Existing Manager`.

All security and timing rules must be enforced server-side, not only by
hiding frontend controls.

## 4. Request lifecycle

Primary intended lifecycle:

1.  `NEW` --- request created.
2.  `ASSIGNED` --- manager has assigned technician(s).
3.  `ACCEPTED` --- a technician accepts the assignment.
4.  `IN_PROGRESS` --- work has started.
5.  `COMPLETED` --- work has finished.

Other states, such as `ON_HOLD` or `CANCELLED`, should be listed only if
they exist in the current implementation. For multiple technicians,
acceptance/progress may be tracked per assignment. Customer visibility
must follow the configured acceptance rule.

## 5. Functional requirements

  -----------------------------------------------------------------------
  ID                      Requirement             Acceptance criteria
  ----------------------- ----------------------- -----------------------
  FR-01                   Registration and login  Valid users can
                                                  authenticate; invalid
                                                  credentials are
                                                  rejected.

  FR-02                   Manager uniqueness      A second manager
                                                  registration is
                                                  rejected server-side if
                                                  the rule is enabled.

  FR-03                   Create request          An authenticated
                                                  customer can submit a
                                                  valid request; initial
                                                  status is correct.

  FR-04                   Request ownership       Customers can only view
                                                  or modify their own
                                                  requests.

  FR-05                   Timed edit/delete       The API permits
                                                  eligible changes within
                                                  20 minutes and rejects
                                                  changes outside the
                                                  allowed window.

  FR-06                   Assignment delay        Manager assignment is
                                                  blocked before 30
                                                  minutes, if this is the
                                                  current business rule.

  FR-07                   Technician capacity     The active technician
                                                  limit of six is
                                                  enforced if enabled.

  FR-08                   Multi-technician        Manager can assign
                          assignment              permitted technician(s)
                                                  according to validation
                                                  and capacity rules.

  FR-09                   Acceptance              A technician can accept
                                                  only an authorized
                                                  assignment.

  FR-10                   Contact visibility      Customer sees
                                                  technician details only
                                                  after acceptance,
                                                  according to the rule.

  FR-11                   Work progress           Authorized technicians
                                                  can update status
                                                  through allowed
                                                  transitions.

  FR-12                   History and feedback    These features work
                                                  where implemented.

  FR-13                   API docs                Deployed API exposes
                                                  Swagger at `/docs`.

  FR-14                   Frontend integration    Frontend uses a
                                                  configurable API base
                                                  URL and backend CORS
                                                  allows its deployed
                                                  origin.
  -----------------------------------------------------------------------

## 6. Non-functional requirements

-   **Security:** Authentication and role authorization on protected
    operations.
-   **Privacy:** Only expose information permitted for the requesting
    role.
-   **Maintainability:** Keep routes, models, schemas, services, and
    configuration understandable.
-   **Usability:** Make role-specific dashboards and statuses clear.
-   **Reliability:** Validate input and return appropriate HTTP errors.
-   **Deployability:** Keep local settings and cloud environment
    variables separate.
-   **Data safety:** Document SQLite storage and hosting persistence
    limitations.

## 7. Out of scope unless confirmed in code

Do not assume the following are implemented: SMS OTP, payments, live
GPS, email verification, real-time chat, external notification delivery,
or a production-grade multi-instance database.

## 8. Data concepts

Expected concepts include user/account and role, customer profile,
technician profile, service request, technician assignment, service
category, notification, and feedback. Actual model names, fields,
constraints, and relationships must be taken from the current SQLAlchemy
models.

## 9. Release acceptance checklist

-   [ ] Customer can register, log in, create and view their own
    requests.
-   [ ] Timed edit/delete rule is enforced by the API.
-   [ ] Assignment timing and technician capacity rules are enforced by
    the API.
-   [ ] Duplicate manager registration is rejected if uniqueness is
    required.
-   [ ] Technician can accept assigned work and update progress.
-   [ ] Customer technician visibility follows acceptance rules.
-   [ ] Ownership and role permissions are tested.
-   [ ] Frontend uses the deployed backend URL.
-   [ ] CORS allows the exact frontend origin.
-   [ ] Database persistence is verified across redeployment.
-   [ ] README setup works on a clean machine.
-   [ ] Test results and known issues are documented.

## 10. Items to verify

-   Final frontend URL and hosting provider.
-   Exact SQLite path and persistence behavior in FastAPI Cloud.
-   Whether optional features such as notifications, feedback, reports,
    and uploads are implemented and tested.
-   Current test suite results.
-   Supported statuses and exact endpoint names.
