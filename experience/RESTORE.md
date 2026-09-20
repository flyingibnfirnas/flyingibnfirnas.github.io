# Restore pre-Virtek journey

A full copy of this `experience/` tree (before the Virtek chapter) lives at:

```text
../_checkpoint_pre_virtek_experience/
```

To discard Virtek and reset:

```bash
cd /home/mhelal/projects/flyingibnfirnas.github.io
rm -rf experience
cp -a _checkpoint_pre_virtek_experience experience
rm -f experience/RESTORE.txt experience/RESTORE.md
```

Then hard-refresh http://127.0.0.1:5173/
