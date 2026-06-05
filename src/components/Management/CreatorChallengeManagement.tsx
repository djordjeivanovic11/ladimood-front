'use client';

import React from 'react';
import {
  deleteCreatorChallengeSubmission,
  fetchCreatorChallengeSubmissions,
  updateCreatorChallengeSubmission,
  type CreatorChallengeMilestone,
  type CreatorChallengeStatus,
  type CreatorChallengeSubmission,
} from '@/api/management/axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPhoneNumber } from '@/lib/phone';
import { ExternalLink, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 15;

const statusLabels: Record<CreatorChallengeStatus, string> = {
  pending: 'Na čekanju',
  reviewing: 'U pregledu',
  approved: 'Odobrena',
  rejected: 'Odbijena',
  rewarded: 'Nagrađena',
};

const milestoneLabels: Record<CreatorChallengeMilestone, string> = {
  none: 'Nije dostignuto',
  views_2k: '2.000+ pregleda',
  views_10k: '10.000+ pregleda',
  viral: 'Viral / poseban dizajn',
};

const milestoneShortLabels: Record<CreatorChallengeMilestone, string> = {
  none: '—',
  views_2k: '2K',
  views_10k: '10K',
  viral: 'Viral',
};

const statusVariants: Record<
  CreatorChallengeStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'secondary',
  reviewing: 'outline',
  approved: 'default',
  rejected: 'destructive',
  rewarded: 'default',
};

const milestoneVariants: Record<
  CreatorChallengeMilestone,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  none: 'outline',
  views_2k: 'secondary',
  views_10k: 'default',
  viral: 'default',
};

function formatDateTime(value?: string | null): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function isUnseen(submission: CreatorChallengeSubmission): boolean {
  return !submission.seen_at;
}

function applySubmissionUpdate(
  submissions: CreatorChallengeSubmission[],
  updated: CreatorChallengeSubmission
) {
  return submissions.map((item) => (item.id === updated.id ? updated : item));
}

export default function CreatorChallengeManagement() {
  const [submissions, setSubmissions] = React.useState<CreatorChallengeSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [milestoneFilter, setMilestoneFilter] = React.useState<string>('all');
  const [seenFilter, setSeenFilter] = React.useState<string>('all');
  const [platformFilter, setPlatformFilter] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selected, setSelected] = React.useState<CreatorChallengeSubmission | null>(null);
  const [editStatus, setEditStatus] = React.useState<CreatorChallengeStatus>('pending');
  const [editMilestone, setEditMilestone] = React.useState<CreatorChallengeMilestone>('none');
  const [editViewCount, setEditViewCount] = React.useState('');
  const [editNotes, setEditNotes] = React.useState('');
  const [editSeen, setEditSeen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [markingSeenId, setMarkingSeenId] = React.useState<number | null>(null);

  const unseenCount = React.useMemo(
    () => submissions.filter((submission) => isUnseen(submission)).length,
    [submissions]
  );

  const loadSubmissions = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCreatorChallengeSubmissions();
      setSubmissions(
        data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Učitavanje prijava nije uspjelo.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return submissions.filter((submission) => {
      if (statusFilter !== 'all' && submission.status !== statusFilter) return false;
      if (milestoneFilter !== 'all' && submission.milestone !== milestoneFilter) return false;
      if (seenFilter === 'unseen' && !isUnseen(submission)) return false;
      if (seenFilter === 'seen' && isUnseen(submission)) return false;
      if (platformFilter !== 'all' && submission.platform !== platformFilter) return false;
      if (!query) return true;
      return [
        submission.full_name,
        submission.email,
        submission.phone,
        submission.video_url,
        submission.instagram_handle ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [submissions, statusFilter, milestoneFilter, seenFilter, platformFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, milestoneFilter, seenFilter, platformFilter, search]);

  const openDetails = (submission: CreatorChallengeSubmission) => {
    setSelected(submission);
    setEditStatus(submission.status);
    setEditMilestone(submission.milestone);
    setEditViewCount(submission.view_count != null ? String(submission.view_count) : '');
    setEditNotes(submission.admin_notes ?? '');
    setEditSeen(Boolean(submission.seen_at));
  };

  const patchSubmission = async (
    submissionId: number,
    payload: Parameters<typeof updateCreatorChallengeSubmission>[1]
  ) => {
    const updated = await updateCreatorChallengeSubmission(submissionId, payload);
    setSubmissions((prev) => applySubmissionUpdate(prev, updated));
    setSelected((current) => (current?.id === updated.id ? updated : current));
    return updated;
  };

  const handleMarkSeen = async (submission: CreatorChallengeSubmission) => {
    setMarkingSeenId(submission.id);
    try {
      await patchSubmission(submission.id, { seen: true });
      toast.success('Označeno kao viđeno.');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Označavanje nije uspjelo.');
    } finally {
      setMarkingSeenId(null);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const confirmed = window.confirm(
      `Obriši prijavu #${selected.id} (${selected.full_name})? Ova akcija je trajna.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteCreatorChallengeSubmission(selected.id);
      setSubmissions((prev) => prev.filter((item) => item.id !== selected.id));
      setSelected(null);
      toast.success('Prijava je obrisana.');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Brisanje nije uspjelo.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!selected) return;

    const parsedViewCount = editViewCount.trim();
    let viewCount: number | null = null;
    if (parsedViewCount) {
      const numeric = Number(parsedViewCount);
      if (!Number.isInteger(numeric) || numeric < 0) {
        toast.error('Broj pregleda mora biti cijeli broj veći ili jednak 0.');
        return;
      }
      viewCount = numeric;
    }

    setSaving(true);
    try {
      await patchSubmission(selected.id, {
        status: editStatus,
        milestone: editMilestone,
        view_count: viewCount,
        admin_notes: editNotes.trim() || null,
        seen: editSeen,
      });
      toast.success('Prijava je ažurirana.');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ažuriranje nije uspjelo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Učitavanje prijava...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Ladimood igra — prijave reelova</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {unseenCount} novo · {submissions.length} ukupno
          </p>
        </div>
        {unseenCount > 0 ? <Badge variant="secondary">{unseenCount} novo</Badge> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Input
            placeholder="Pretraži ime, email, link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="xl:col-span-2"
          />
          <Select value={seenFilter} onValueChange={setSeenFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Pregled" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve prijave</SelectItem>
              <SelectItem value="unseen">Samo novo</SelectItem>
              <SelectItem value="seen">Samo viđeno</SelectItem>
            </SelectContent>
          </Select>
          <Select value={milestoneFilter} onValueChange={setMilestoneFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Uspijeh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi pragovi</SelectItem>
              <SelectItem value="none">Nije dostignuto</SelectItem>
              <SelectItem value="views_2k">2.000+ pregleda</SelectItem>
              <SelectItem value="views_10k">10.000+ pregleda</SelectItem>
              <SelectItem value="viral">Viral</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="pending">Na čekanju</SelectItem>
              <SelectItem value="reviewing">U pregledu</SelectItem>
              <SelectItem value="approved">Odobrena</SelectItem>
              <SelectItem value="rejected">Odbijena</SelectItem>
              <SelectItem value="rewarded">Nagrađena</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Platforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve platforme</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => void loadSubmissions()}>
            Osvježi
          </Button>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Datum</th>
                <th className="px-4 py-3 text-left font-medium">Ime</th>
                <th className="px-4 py-3 text-left font-medium">Kontakt</th>
                <th className="px-4 py-3 text-left font-medium">Platforma</th>
                <th className="px-4 py-3 text-left font-medium">Uspijeh</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Nema prijava za prikaz.
                  </td>
                </tr>
              ) : (
                pageItems.map((submission) => (
                  <tr
                    key={submission.id}
                    className={`border-t ${isUnseen(submission) ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {formatDateTime(submission.created_at)}
                        {isUnseen(submission) ? (
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            Novo
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">{submission.full_name}</td>
                    <td className="px-4 py-3">
                      <div>{submission.email}</div>
                      <div className="text-muted-foreground">
                        {formatPhoneNumber(submission.phone)}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{submission.platform}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <Badge variant={milestoneVariants[submission.milestone]}>
                          {milestoneShortLabels[submission.milestone]}
                        </Badge>
                        {submission.view_count != null ? (
                          <div className="text-xs text-muted-foreground">
                            {submission.view_count.toLocaleString()} pregleda
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariants[submission.status]}>
                        {statusLabels[submission.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {isUnseen(submission) ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={markingSeenId === submission.id}
                            onClick={() => void handleMarkSeen(submission)}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Viđeno
                          </Button>
                        ) : null}
                        <Button size="sm" variant="outline" onClick={() => openDetails(submission)}>
                          Detalji
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={submission.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Otvori video"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} prijava · stranica {currentPage} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Prethodna
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Sljedeća
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Prijava #{selected?.id}</DialogTitle>
          </DialogHeader>

          {selected ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{selected.full_name}</p>
                  <p className="text-muted-foreground">{selected.email}</p>
                  <p className="text-muted-foreground">{formatPhoneNumber(selected.phone)}</p>
                </div>
                {editSeen ? (
                  <Badge variant="outline">Viđeno</Badge>
                ) : (
                  <Badge variant="secondary">Novo</Badge>
                )}
              </div>

              {selected.instagram_handle ? (
                <p>
                  <span className="font-medium">Instagram:</span> {selected.instagram_handle}
                </p>
              ) : null}

              <p>
                <span className="font-medium">Platforma:</span> {selected.platform}
              </p>

              <p className="break-all">
                <span className="font-medium">Video:</span>{' '}
                <a
                  href={selected.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {selected.video_url}
                </a>
              </p>

              {selected.message ? (
                <p>
                  <span className="font-medium">Poruka:</span> {selected.message}
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="submission-milestone">Prag uspijeh</Label>
                <Select
                  value={editMilestone}
                  onValueChange={(value: CreatorChallengeMilestone) => setEditMilestone(value)}
                >
                  <SelectTrigger id="submission-milestone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(milestoneLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="submission-view-count">Broj pregleda</Label>
                <Input
                  id="submission-view-count"
                  type="number"
                  min={0}
                  placeholder="npr. 2450"
                  value={editViewCount}
                  onChange={(e) => setEditViewCount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submission-status">Status obrade</Label>
                <Select
                  value={editStatus}
                  onValueChange={(value: CreatorChallengeStatus) => setEditStatus(value)}
                >
                  <SelectTrigger id="submission-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="submission-notes">Interna napomena</Label>
                <textarea
                  id="submission-notes"
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={editSeen ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => setEditSeen(true)}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Označi viđeno
                </Button>
                <Button
                  type="button"
                  variant={editSeen ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setEditSeen(false)}
                >
                  <EyeOff className="mr-1 h-4 w-4" />
                  Označi kao novo
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Poslato: {formatDateTime(selected.created_at)}
                {selected.seen_at ? ` · Viđeno: ${formatDateTime(selected.seen_at)}` : ''}
                {selected.reviewed_at
                  ? ` · Ažurirano: ${formatDateTime(selected.reviewed_at)}`
                  : ''}
              </p>
            </div>
          ) : null}

          <DialogFooter className="flex-row items-center justify-between gap-3 sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleting || saving}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Brisanje...' : 'Obriši'}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelected(null)}
                disabled={deleting || saving}
              >
                Zatvori
              </Button>
              <Button onClick={() => void handleSave()} disabled={saving || deleting}>
                {saving ? 'Čuvanje...' : 'Sačuvaj'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
