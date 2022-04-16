/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI";
import { localStorageMock } from "../__mocks__/localStorage";
import { ROUTES } from "../constants/routes";
import store from "../__mocks__/store";
import Store from "../app/Store";

// identify as employee
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

Object.defineProperty(window, "LocalStorage", { value: localStorageMock });
window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
});

describe("Given I am on NewBill Page", () => {
  describe("When I upload an image file", () => {
    test("Then the file extension is correct", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      //loading file
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const inputFile = screen.queryByTestId("file");

      // addeventlistener file
      inputFile.addEventListener("change", handleChangeFile);

      //fire event
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["myTest.png"], "myTest.png", { type: "image/png" }),
          ],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0].name).toBe("myTest.png");
    });
  });
});

describe("Given I am on NewBill Page", () => {
  describe("And I submit a valid bill form", () => {
    test("Then a bill is created", async () => {
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      //create new bill form
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const newBillForm = screen.getByTestId("form-new-bill");
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

//integration
describe("Given I am a user connected as en Employee", () => {
  describe("When I valid bill form", () => {
    test("Then a bill is created", async () => {
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      //new bill with handleSubmit
      const submit = screen.queryByTestId("form-new-bill");
      const billTest = {
        name: "testing",
        date: "2001-04-15",
        amount: 400,
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        pct: 25,
        vat: 12,
        commentary: "C'est un test",
        fileName: "testing",
        fileUrl: "testing.jpg",
      };

      //click submit
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      //apply to the DOM
      newBill.createBill = (newBill) => newBill;
      document.querySelector(`select[data-testid="expense-type"]`).value =
        billTest.type;
      document.querySelector(`input[data-testid="expense-name"]`).value =
        billTest.name;
      document.querySelector(`input[data-testid="datepicker"]`).value =
        billTest.date;
      document.querySelector(`input[data-testid="amount"]`).value =
        billTest.amount;
      document.querySelector(`input[data-testid="vat"]`).value = billTest.vat;
      document.querySelector(`input[data-testid="pct"]`).value = billTest.pct;
      document.querySelector(`textarea[data-testid="commentary"]`).value =
        billTest.commentary;
      newBill.fileUrl = billTest.fileUrl;
      newBill.fileName = billTest.fileName;

      submit.addEventListener("click", handleSubmit);

      fireEvent.click(submit);

      //verify if handleSubmit was called
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

describe("When I navigate to the newbill page, and I want to post an PNG file", () => {
  test("Then function handleChangeFile should be called", () => {
    const html = NewBillUI();
    document.body.innerHTML = html;
    jest.spyOn(Store.api, "post").mockImplementation(store.post);

    const newBill = new NewBill({
      document,
      onNavigate,
      store: Store,
      localStorage: window.localStorage,
    });
    const handleChangeFile = jest.fn(newBill.handleChangeFile);
    const file = screen.getByTestId("file");

    file.addEventListener("change", handleChangeFile);
    fireEvent.change(file, {
      target: {
        files: [new File(["image"], "test.png", { type: "image/png" })],
      },
    });
    expect(handleChangeFile).toHaveBeenCalled();
  });
});

describe("When I navigate to the newbill page, and I want to post an PDF file", () => {
  test("Then function handleChangeFile should be called", () => {
    const html = NewBillUI();
    document.body.innerHTML = html;
    jest.spyOn(Store.api, "post").mockImplementation(store.post);

    const newBill = new NewBill({
      document,
      onNavigate,
      store: Store,
      localStorage: window.localStorage,
    });

    const file = screen.getByTestId("file");

    const handleChangeFile = jest.fn(newBill.handleChangeFile);

    file.addEventListener("change", handleChangeFile);

    fireEvent.change(file, {
      target: {
        files: [new File(["image"], "test.pdf", { type: "image/pdf" })],
      },
    });
    expect(handleChangeFile).toHaveBeenCalled();
    expect(file.value).toBe("");
  });
});

describe("When an error occurs on API", () => {
  beforeEach(() => {
    jest.spyOn(store, "bills");
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);
  });
  test("fetches bills from an API and fails with 404 message error", async () => {
    store.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    const html = BillsUI({ error: "Erreur 404" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    store.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });

    const html = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
