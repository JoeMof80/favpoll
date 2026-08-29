// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchPhotoDataUrl } from "../photo"

function response(body: Uint8Array, type: string, ok = true): Response {
  return {
    ok,
    headers: new Headers({ "content-type": type }),
    arrayBuffer: async () =>
      body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
  } as unknown as Response
}

describe("fetchPhotoDataUrl", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("inlines a jpeg as a data url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        response(new Uint8Array([1, 2, 3]), "image/jpeg; charset=binary")
      )
    )
    await expect(fetchPhotoDataUrl("https://cdn.test/a.jpg")).resolves.toBe(
      "data:image/jpeg;base64,AQID"
    )
  })

  it("refuses anything that is not an https url", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    await expect(fetchPhotoDataUrl(null)).resolves.toBeNull()
    await expect(fetchPhotoDataUrl("")).resolves.toBeNull()
    await expect(fetchPhotoDataUrl("http://cdn.test/a.jpg")).resolves.toBeNull()
    await expect(fetchPhotoDataUrl("file:///etc/passwd")).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("degrades to null on a bad status, a type Satori cannot draw, an empty body, or an oversize one", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response(new Uint8Array([1]), "image/jpeg", false))
    )
    await expect(
      fetchPhotoDataUrl("https://cdn.test/a.jpg")
    ).resolves.toBeNull()

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response(new Uint8Array([1]), "image/heic"))
    )
    await expect(
      fetchPhotoDataUrl("https://cdn.test/a.heic")
    ).resolves.toBeNull()

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response(new Uint8Array([]), "image/png"))
    )
    await expect(
      fetchPhotoDataUrl("https://cdn.test/a.png")
    ).resolves.toBeNull()

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response(new Uint8Array(10), "image/png"))
    )
    await expect(
      fetchPhotoDataUrl("https://cdn.test/a.png", { maxBytes: 5 })
    ).resolves.toBeNull()
  })

  it("degrades to null when the fetch throws (timeout, DNS, anything)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("aborted")
      })
    )
    await expect(
      fetchPhotoDataUrl("https://cdn.test/a.jpg")
    ).resolves.toBeNull()
  })
})
