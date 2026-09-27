"""Cluster the pilot charities by the concrete thing at the centre of their
work (the Haiku labels), so a topic can be proposed once per cluster.

Reads  register/pilot-animals-environment.json + register/pilot-labels.json
Writes register/pilot-clusters.json  (cluster -> charities, sorted by size)
       and prints the table.
"""
import json, re, collections, sys
S = "/private/tmp/claude-501/-Users-josephmoffatt-Development-favpoll/886def39-5a9a-4af9-ab73-fc4eaba930da/scratchpad/register"
rows = {str(r["organisation_number"]): r for r in json.load(open(f"{S}/pilot-animals-environment.json"))}
labels = json.load(open(f"{S}/pilot-labels.json"))

STOP = {"a", "an", "the", "of", "and", "for", "in", "its", "their", "local", "uk", "national", "network", "sites", "site"}
# crude stemming so "gardens" and "garden", "canals" and "canal" meet
def stem(w):
    w = w.lower()
    for suf in ("ies", "es", "s"):
        if w.endswith(suf) and len(w) > len(suf) + 2:
            return w[: -len(suf)] + ("y" if suf == "ies" else "")
    return w

def key(thing):
    words = [stem(w) for w in re.findall(r"[a-z]+", thing.lower()) if w not in STOP]
    return " ".join(sorted(set(words)))

clusters = collections.defaultdict(list)
none = []
failed = 0
for on, lab in labels.items():
    r = rows.get(on)
    if not r:
        continue
    if lab.get("error"):
        failed += 1
        continue
    if lab.get("none"):
        none.append(r["name"])
        continue
    k = f"{lab.get('kind','other')} | {key(lab.get('thing',''))}"
    clusters[k].append({"name": r["name"], "thing": lab.get("thing"), "income": r["income"], "email": bool(r["email"]), "local": lab.get("local"), "on": on})

# merge tiny clusters into their kind when the thing is a one-off
by_kind = collections.defaultdict(list)
for k, members in clusters.items():
    by_kind[k.split(" | ")[0]].append((k, members))

out = []
for k, members in sorted(clusters.items(), key=lambda kv: -len(kv[1])):
    out.append({"cluster": k, "kind": k.split(" | ")[0], "thing": k.split(" | ")[1], "n": len(members), "members": sorted(members, key=lambda m: -(m["income"] or 0))})
json.dump(out, open(f"{S}/pilot-clusters.json", "w"), indent=1)

print(f"{len(labels)} labelled, {len(none)} none, {failed} failed, {len(clusters)} clusters")
print("by kind:", collections.Counter(k.split(' | ')[0] for k in clusters for _ in clusters[k]).most_common())
print()
print("clusters with 3+ charities:")
for c in out:
    if c["n"] >= 3:
        print(f"  {c['n']:3d}  {c['cluster']:<50} e.g. {', '.join(m['name'].title()[:34] for m in c['members'][:3])}")
print()
print("singletons:", sum(1 for c in out if c["n"] == 1))
