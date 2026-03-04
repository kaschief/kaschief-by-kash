import { describe, expect, it } from "vitest";
import { LIST_ROW_ARROW_STYLE, ListRowArrow } from "./list-row";

describe("ListRowArrow", () => {
  it("hides arrows on mobile breakpoints by default", () => {
    const element = ListRowArrow({ hovered: false, color: "#fff" });
    const props = element.props as {
      className: string;
      style: Record<string, unknown>;
    };

    expect(props.className).toContain("hidden");
    expect(props.className).toContain("sm:inline-flex");
    expect(props.style.display).toBeUndefined();
  });

  it("renders line arrow as default variant", () => {
    const element = ListRowArrow({ hovered: false, color: "#fff" });
    const props = element.props as { children: string };

    expect(props.children).toBe("→");
  });

  it("renders chevron icon for chevron variant", () => {
    const element = ListRowArrow({
      hovered: true,
      color: "#fff",
      variant: LIST_ROW_ARROW_STYLE.CHEVRON,
    });
    const props = element.props as {
      children: { type: string };
    };

    expect(props.children.type).toBe("svg");
  });
});
