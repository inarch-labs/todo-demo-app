export const sampleNotes = [
  {
    title: 'Meeting with Peter — Todo App v2 Launch Planning',
    body: `Synced with Peter today about the v2 launch timeline. He's targeting a blog post the week of the launch and a customer email going out the same day. Both need assets from me.

For the blog post: needs a hero image (product shot of the new UI) and two or three supporting screenshots showing the key new features. Peter wants them sized for the blog template — he'll send me the spec but said roughly 1200×630 for the hero. Copy is still being finalized but he thinks it'll be ready by end of next week.

For the customer email: Maya is owning the copy but she needs a header image and a feature highlight graphic. Peter said to coordinate with Maya directly on sizing since she has the email template constraints. Tone should feel warmer than the blog — this is going to existing users.

Launch date is still TBD but Peter is pushing for the 28th. He said if assets aren't ready by the 24th it'll slip the blog post.

One more thing — Elaine mentioned she wants a design review of the new onboarding flow before it ships. I need to get on her calendar for that.`,
  },
  {
    title: 'Meeting with Maya — Launch Email & Blog Assets',
    body: `Caught up with Maya about the customer email for the v2 launch. She's using Klaviyo to send and flagged some constraints I need to keep in mind. Their template maxes out at 600px wide, and Outlook still makes up a big chunk of their list so I can't use anything with a background image or fancy CSS — basically everything needs to be a flat PNG or JPEG, no SVGs, no GIFs. She also said to keep file sizes under 200KB per image or they get clipped on mobile.

Header image should be 600×200. She wants one feature highlight graphic below that, also 600px wide but more flexible on height.

Important: Priya (Maya's coordinator who handles the actual send setup) is out of office all of next week. That means Maya needs everything from me by this Friday so Priya can get it set up before she leaves. I thought I had until the 24th but this changes things.

Maya is still waiting on final copy approval from Peter but said I can start on the visuals now since the sizing constraints won't change.

One more thing — all final copy and assets need to be submitted to marketing ops via a Jira ticket before they can schedule the send. Maya said that ticket needs to be in by Wednesday the 23rd at the latest or the email won't go out on launch day. She'll co-own the ticket but I need to open it and attach everything.`,
  },
  {
    title: 'Meeting with Elaine — Eng Review & Content Deadline',
    body: `Quick check-in with Elaine about what's left before v2 ships. She flagged that any changes touching the UI — even small copy tweaks — need to go through a content review before they can be merged. The content team only does reviews on Tuesdays and Thursdays, and the blog post goes live on the 28th.

Elaine said the hard cutoff for getting changes into the build that the content team will review is Monday the 21st. Anything that misses that review cycle won't make it into the launch build — it would have to wait for a patch. She was pretty firm on this.

I also owe her a design review of the new onboarding flow. She's blocked on final sign-off until I look at it. She mentioned she already sent me a Figma link last week — I need to find that and book time on her calendar before the end of this week.`,
  },
]

export const sampleStandaloneTodos: never[] = []
