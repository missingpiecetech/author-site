import { RuleList, RuleRow } from "../ui/RuleList";
import { FiligreeCorners } from "../ui/Filigree";

/**
 * One contact column: heading, lede, the email row and the "good for" list.
 * Every flex/grid child that holds the address carries `min-w-0`, and the
 * address itself `break-all`, so a long email can never widen the page.
 */
const ContactChannel = ({
  title,
  lede,
  icon,
  label,
  email,
  listTitle,
  items,
}) => (
  <div className="flex min-w-0 flex-col gap-8">
    <div className="flex flex-col gap-3">
      <h2 className="text-heading text-cream">{title}</h2>
      <p className="text-lede text-muted">{lede}</p>
    </div>

    <RuleList>
      <RuleRow className="min-w-0">
        <span
          aria-hidden="true"
          className="relative flex h-12 w-12 shrink-0 items-center justify-center border border-accent/50 text-2xl text-accent"
        >
          {icon}
          <FiligreeCorners size="xs" />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-medium text-cream">{label}</p>
          <a
            href={`mailto:${email}`}
            className="block min-w-0 break-all text-lg text-accent transition-colors hover:text-accent-hover hover:underline"
          >
            {email}
          </a>
        </div>
      </RuleRow>
    </RuleList>

    <div className="flex flex-col gap-4">
      <h3 className="text-[1.75rem] leading-tight text-cream">{listTitle}</h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start text-muted">
            <span aria-hidden="true" className="mr-3 shrink-0 text-accent">
              •
            </span>
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default ContactChannel;
