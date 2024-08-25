import { z } from "zod";

const associationLinksSchema = z.array(
    z.object({
        type: z.union([z.literal("github"), z.literal("twitter")]),
        id: z.string(),
        name: z.string(),
    }),
);
export type AssociationLinks = z.infer<typeof associationLinksSchema>;

export async function getAssociationLinks(
    discordId: string,
): Promise<AssociationLinks> {
    const associationsRes = await fetch(
        `https://members.approvers.dev/members/${discordId}/associations`,
    );
    const associations = associationLinksSchema.parse(
        await associationsRes.json(),
    );
    return associations;
}
