import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadBox } from "./UploadBox";

// Install the object-URL spies once. React 19 flushes unmount cleanups asynchronously
// (after afterEach), so restoring these to jsdom's `undefined` between tests would make a
// deferred revoke throw. Instead we keep the spies installed and only reset call counts.
const createSpy = vi.fn(() => "blob:fake-url");
const revokeSpy = vi.fn();
URL.createObjectURL = createSpy;
URL.revokeObjectURL = revokeSpy;

beforeEach(() => {
  createSpy.mockClear();
  revokeSpy.mockClear();
});

function fileInput(container) {
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error("file input not found");
  return input;
}

describe("UploadBox — credential preview (FR-07)", () => {
  it("renders an <img> thumbnail from the object URL when an image is selected", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <UploadBox label="Jockey License Copy" onFile={vi.fn()} />,
    );

    const image = new File(["x"], "license.png", { type: "image/png" });
    await user.upload(fileInput(container), image);

    expect(createSpy).toHaveBeenCalledWith(image);
    const img = await screen.findByRole("img");
    expect(img).toHaveAttribute("src", "blob:fake-url");
    expect(img).toHaveAttribute("alt");
    expect(img.getAttribute("alt")).not.toBe("");
  });

  it("shows the filename and no <img> for a PDF", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <UploadBox label="Jockey License Copy" onFile={vi.fn()} />,
    );

    const pdf = new File(["x"], "license.pdf", { type: "application/pdf" });
    await user.upload(fileInput(container), pdf);

    expect(await screen.findByText("license.pdf")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("revokes the previous object URL on a second selection (no leak)", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <UploadBox label="Jockey License Copy" onFile={vi.fn()} />,
    );

    await user.upload(
      fileInput(container),
      new File(["x"], "a.png", { type: "image/png" }),
    );
    expect(revokeSpy).not.toHaveBeenCalled();

    await user.upload(
      fileInput(container),
      new File(["y"], "b.png", { type: "image/png" }),
    );
    expect(revokeSpy).toHaveBeenCalledWith("blob:fake-url");
  });

  it("revokes the object URL on unmount (no leak)", async () => {
    const user = userEvent.setup();
    const { container, unmount } = render(
      <UploadBox label="Jockey License Copy" onFile={vi.fn()} />,
    );

    await user.upload(
      fileInput(container),
      new File(["x"], "a.png", { type: "image/png" }),
    );
    unmount();
    expect(revokeSpy).toHaveBeenCalledWith("blob:fake-url");
  });

  it("forwards the selected file to onFile", async () => {
    const user = userEvent.setup();
    const onFile = vi.fn();
    const { container } = render(
      <UploadBox label="Jockey License Copy" onFile={onFile} />,
    );

    const pdf = new File(["x"], "license.pdf", { type: "application/pdf" });
    await user.upload(fileInput(container), pdf);

    expect(onFile).toHaveBeenCalledWith(pdf);
  });
});
