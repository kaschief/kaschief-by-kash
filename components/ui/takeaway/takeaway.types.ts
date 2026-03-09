export interface TakeawayProps {
  /** Unique ID for the sticky zone (must be unique across the page) */
  id: string;
  /** The takeaway quote text */
  text: string;
  /** Sticky zone height, defaults to "150vh" */
  height?: string;
}
