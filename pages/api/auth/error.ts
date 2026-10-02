import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const error = req.query.error as string | undefined;

    const redirectTo = `/?auth_error=${ encodeURIComponent(error ?? "unknown_error") }`;
    res.writeHead(302, { Location: redirectTo });
    res.end();
}
