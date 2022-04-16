/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { convertToDate } from "../app/format.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills";
import router from "../app/Router.js";
import { ROUTES } from "../constants/routes";
import store from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression

      expect(windowIcon).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      // const antiChrono = (a, b) => ((a < b) ? 1 : -1)

      const antiChrono = (date1, date2) => {
        const d1 = convertToDate(date1);
        const d2 = convertToDate(date2);

        if (d1 <= d2) return 1;
        if (d1 > d2) return -1;
      };
      const datesSorted = [...dates].sort(antiChrono);

      expect(dates).toEqual(datesSorted);
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bill Page", () => {
    test("Then return bills data", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      store.bills = jest.fn().mockImplementationOnce(() => {
        return {
          list: jest
            .fn()
            .mockResolvedValue([{ id: 1, data: () => ({ date: "" }) }]),
        };
      });

      const bills = new Bills({
        document,
        onNavigate,
        store: store,
        localStorage,
      });

      const res = bills.getBills();

      expect(res).toEqual(Promise.resolve({}));
    });
  });
});

describe("Given I try to connect Bill page as an Employee", () => {
  describe("When I am Login Page", () => {
    test("Then it should render LoadingPage", () => {
      //loading Page
      document.body.innerHTML = BillsUI({
        loading: true,
      });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
    //error Page
    test("Then it should render ErrorPage", () => {
      document.body.innerHTML = BillsUI({ error: true });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
});

describe("When I am on Bills page but back-end send an error message", () => {
  test("Then, Error page should be rendered", () => {
    document.body.innerHTML = BillsUI({
      error: "some error message",
    });
    expect(screen.getAllByText("Erreur")).toBeTruthy();
  });
});

describe("When there are bills on the Bill page", () => {
  test("It should display an icon eye", () => {
    document.body.innerHTML = BillsUI({ data: bills });
    const iconEye = screen.getAllByTestId("icon-eye");
    expect(iconEye).toBeTruthy();
  });
});

describe("Given I am employee", () => {
  describe("When I navigate to Bill page", () => {
    test("When I click on new bill button then a modal should open", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname,
        });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = BillsUI({
        data: bills,
      });
      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        bills,
        localStorage: window.localStorage,
      });
      $.fn.modal = jest.fn();

      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill);

      const iconNewBill = screen.getByTestId("btn-new-bill");
      iconNewBill.addEventListener("click", handleClickNewBill);
      fireEvent.click(iconNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();

      const modale = screen.getAllByTestId("form-new-bill");
      expect(modale).toBeTruthy();
    });
  });
});
