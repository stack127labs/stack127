# Brief: 3-2-1 backup calculator

## Who is here

A homelab owner is deciding how large two backup targets should be before buying a drive or assigning space to an off-site copy. They know the current protected data size and a rough retention policy, but they do not want to reverse-engineer full and incremental storage behavior from a hidden formula.

## The job

They leave with the projected source size, the capacity needed for one local target, the capacity needed for one off-site target, and the combined target capacity. An optional recovery check compares their backup interval and estimated full-restore time with RPO and RTO goals.

## Show vs say

The workbench stays first and asks for source data, growth, horizon, backup model, retained points, changed data per backup, and headroom. The result leads with capacity per target, then uses an exact capacity-anatomy visual and labeled values for the repository estimate and headroom. A short copy map explains that the source is copy 1 and the local and off-site targets are copies 2 and 3 without claiming compliance. Supporting prose explains the model, uncertainty, recovery estimate, and limits, then links to the course lesson about restore tests and practical backup habits. No marker art or live price visual is needed.
