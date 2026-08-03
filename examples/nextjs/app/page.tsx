'use client';

import { BellIcon, CheckIcon, MailIcon, ShoppingCartIcon, TagIcon, TrashIcon } from '@heroicons/react/outline';
import { getCookie, hasCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next13-progressbar';
import React, { useMemo } from 'react';
import { useEffect, useState } from 'react';
import type { NotificationChannel, NotificationItem, NotificationPlatform } from 'rws-js';

import { poppins } from '@/app/_styles/font/_font';
import Loading from '@/app/_template/Loading';
import NavbarMob from '@/app/_template/navbar/mobile/NavbarMob';
import { useRWS } from '@/providers/RWSProvider';
import { useGetDataAccountQuery, useGetPengajuanRoleQuery } from '@/services/auth.service';
import { getFetch } from '@/utils/fetch';

type UpgradeRole = {
    title: string;
    desc: string;
    desc_setting: string;
    gambar: string;
    link: string;
};

const CHANNEL_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    all: { label: 'Semua', icon: ShoppingCartIcon },
    messages: { label: 'Pesan', icon: MailIcon },
    promo: { label: 'Promo', icon: TagIcon },
};

function formatTime(iso: string): string {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    if (diff < 60_000) return 'Baru saja';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} menit lalu`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} jam lalu`;
    if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function NotifikasiMob(props: any) {
    const router = useRouter();
    const { connectionState, notifications, connect, refresh, markAsRead, markAllAsRead, markAsDelete } = useRWS();
    const [userId, setUserId] = useState<string | null>(null);

    const [selectedPlatform, setSelectedPlatform] = useState(0);
    const [selectedChannel, setSelectedChannel] = useState('all');

    useEffect(() => {
        if (!hasCookie('regar.logged')) return;
        const uid = getCookie('regar.uid');
        if (!uid) return;
        setUserId(String(uid));
        if (connectionState !== 'connected') {
            connect(String(uid)).catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (userId && connectionState === 'connected') {
            refresh().catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, connectionState]);

    useEffect(() => {
        if (hasCookie('regar.logged')) {
            if (getCookie('verified_email_status') == '1' || getCookie('verified_whatsapp_status') == '1') {
                getJumlahPO();
            }
        }
    }, []);

    const [isLoadingDataJumlahPO, setLoadingDataJumlahPO] = useState(false);
    const [error, setError] = useState<any>();
    const [dataJumlahPO, setDataJumlahPO] = useState<any>(null);
    const time = React.useMemo(() => new Date().toISOString(), []);

    const getJumlahPO = async () => {
        setLoadingDataJumlahPO(true);
        try {
            const resp = await getFetch('/quantity/keranjang/total', {});

            if (resp.responseCode != 200) {
                const e = new Error('Gagal memuat data');
                setError(() => {
                    throw e;
                });
            }

            setDataJumlahPO(resp.data);
        } catch (e: any) {
            setError(() => {
                throw e;
            });
        }
        setLoadingDataJumlahPO(false);
    };

    const {
        data: dataAkun,
        refetch: refetchDataAkun,
        isSuccess: isSuccessAkun,
        isUninitialized: isUninitAkun,
    } = useGetDataAccountQuery({ time }, { skip: false });

    const dataAccount = dataAkun?.data?.data_account ?? [];

    const {
        data: pengajuanRoleData,
        isFetching: pengajuanRoleFetching,
        isError: pengajuanRoleError,
    } = useGetPengajuanRoleQuery(undefined, {
        skip: !dataAccount,
        refetchOnMountOrArgChange: true,
    });

    const upgradeRoleData = useMemo<UpgradeRole | null>(
        () => pengajuanRoleData?.data?.dataUpgradeRole?.banner_upgrade?.[0] ?? null,
        [pengajuanRoleData],
    );

    useEffect(() => {}, [notifications]);

    const platforms: NotificationPlatform[] = notifications?.notification_platforms ?? [];
    const channels: NotificationChannel[] = notifications?.notification_channels ?? [];
    const activePlatform = platforms[selectedPlatform] ?? null;
    const activeChannel = channels.find((c) => c.channel == selectedChannel) ?? null;
    console.log(channels, selectedChannel);

    const platformUnreadIds = useMemo(() => {
        const ids = new Set<string>();
        notifications?.notification_platforms?.forEach((p) => p.data?.forEach((n) => !n.is_read && ids.add(n.id)));
        return Array.from(ids);
    }, [notifications]);

    const channelUnreadIds = useMemo(() => {
        const ids = new Set<string>();
        notifications?.notification_channels?.forEach((c) => c.data?.forEach((n) => !n.is_read && ids.add(n.id)));
        return Array.from(ids);
    }, [notifications]);

    const handleBack = () => {
        if (props.backUrl) {
            router.push(props.backUrl); // Navigasi ke URL yang diberikan melalui props
        } else {
            router.back(); // Default, jika tidak ada backUrl
        }
    };

    const handleOpen = async (notif: NotificationItem) => {
        if (!notif.is_read) {
            markAsRead(notif.id).catch(() => {});
        }
        if (notif.link) {
            router.push(notif.link);
        } else {
            router.push(`/notifikasi/detail_notifikasi?id=${notif.id}`);
        }
    };

    const handleMarkAllPlatformRead = () => {
        if (platformUnreadIds.length === 0) return;
        markAllAsRead(platformUnreadIds).catch(() => {});
    };

    const handleMarkAllChannelRead = () => {
        if (channelUnreadIds.length === 0) return;
        markAllAsRead(channelUnreadIds).catch(() => {});
    };

    const handleDelete = (notifId: string) => {
        markAsDelete(notifId).catch(() => {});
    };

    const renderNotifCard = (notif: NotificationItem, Icon: React.ComponentType<{ className?: string }>) => {
        console.log('notif',notif);
        return (
            <div key={notif?.id} className="mt-[12px] flex items-center" style={{ borderBottom: '1px solid #DEDEDE' }}>
                <div className="mb-[14px] p-[2px]">
                    <div className="rounded-[7px] p-[9px]" style={{ border: '1.5px solid #E2E2E2' }}>
                        <Icon className="h-[25px] w-[25px] text-black-000000" />
                    </div>
                </div>
                <div
                    className="mb-[15px] ml-[11px] flex w-full cursor-pointer items-start justify-between"
                    onClick={() => handleOpen(notif)}
                >
                    <div className="w-full pr-[8px]">
                        <p className="text-[14px] font-semibold text-black-363636">{notif?.title}</p>
                        <p className="text-[13px] font-normal text-black-363636">{notif?.message}</p>
                        <p className="mt-[2px] text-[11px] text-black-363636/50">{formatTime(notif?.delivered_at)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-[8px]">
                        {!notif?.is_read ? (
                            <div className="mt-[4px] flex h-2 w-2 items-center justify-center rounded-full bg-red-E93E3E" />
                        ) : null}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notif?.id);
                            }}
                            className="p-[4px]"
                        >
                            <TrashIcon className="h-[18px] w-[18px] text-black-363636/40" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={poppins.className}>
            {/* Header */}
            <div
                className={
                    'fixed left-0 top-0 z-10 flex h-[55px] w-full items-center justify-between bg-white-FFFFFF px-[15px] ' +
                    poppins.className
                }
                style={{ boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.15)' }}
            >
                <div onClick={handleBack} className="flex items-center">
                    <div className="text-[16px] font-medium text-black-363636">Notifikasi</div>
                </div>
                {dataJumlahPO ? (
                    <div className="relative flex w-[50px] justify-center">
                        <Link
                            href={{
                                pathname: '/keranjang',
                                query: { manufaktur_id: 1 },
                            }}
                        >
                            <ShoppingCartIcon className="mx-auto w-[22px] text-black-363636" />

                            {dataJumlahPO?.total_keranjang ? (
                                <div className="absolute -top-1.5 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-D90000 px-[3px] text-center">
                                    <p className="mx-auto text-[10px] font-bold text-white-FFFFFF">
                                        {dataJumlahPO.total_keranjang}
                                    </p>
                                </div>
                            ) : null}
                        </Link>
                    </div>
                ) : (
                    <div className="w-8 text-orange-f08120">
                        <Loading />
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="h-screen bg-white-F7F7F7 pt-[55px]">
                {!userId ? (
                    <div className="bg-white-FFFFFF px-[17px] py-[30px] text-center">
                        <p className="text-[14px] font-semibold text-black-363636">
                            Silakan login untuk melihat notifikasi
                        </p>
                    </div>
                ) : platforms.length === 0 && channels.length === 0 ? (
                    <div className="bg-white-FFFFFF px-[17px] py-[30px] text-center">
                        <BellIcon className="mx-auto h-[40px] w-[40px] text-black-363636/30" />
                        <p className="mt-[10px] text-[14px] font-semibold text-black-363636">Tidak ada notifikasi</p>
                        <p className="mt-[4px] text-[13px] text-black-363636/50">Notifikasi baru akan muncul di sini</p>
                    </div>
                ) : (
                    <>
                        {/* Platform Section */}
                        <div className="bg-white-FFFFFF px-[17px] pb-[12px] pt-[15px]">
                            <div className="flex items-center justify-between">
                                <p className="text-[15px] font-bold text-black-363636">Platform</p>
                                {platformUnreadIds.length > 0 ? (
                                    <button onClick={handleMarkAllPlatformRead} className="flex items-center">
                                        <CheckIcon className="h-[14px] w-[14px] text-black-363636/60" />
                                        <p className="ml-[4px] text-[12px] font-semibold text-black-363636/60">
                                            Tandai semua dibaca
                                        </p>
                                    </button>
                                ) : null}
                            </div>
                            <div className="mt-[12px] flex overflow-x-auto [scrollbar-width:none]">
                                {platforms.map((p, i) => (
                                    <button
                                        key={p.platform}
                                        onClick={() => setSelectedPlatform(i)}
                                        className={`mr-[10px] flex shrink-0 items-center rounded-[8px] px-[14px] py-[9px] ${
                                            i === selectedPlatform
                                                ? 'bg-black-363636 text-white-FFFFFF'
                                                : 'bg-white-FFFFFF text-black-363636'
                                        }`}
                                        style={i !== selectedPlatform ? { border: '1px solid #DEDEDE' } : undefined}
                                    >
                                        <p className="text-[13px] font-semibold">{p.platform}</p>
                                        {p.total_unread > 0 ? (
                                            <div className="ml-[8px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-D90000 px-[3px]">
                                                <p className="text-[9px] font-bold text-white-FFFFFF">
                                                    {p.total_unread > 99 ? '99+' : p.total_unread}
                                                </p>
                                            </div>
                                        ) : null}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List Platform Notifications */}
                        <div className="mt-[10px] bg-white-FFFFFF px-[17px] pb-[8px] pt-[13px]">
                            {activePlatform?.data?.length ? (
                                activePlatform.data.map((notif) => renderNotifCard(notif, BellIcon))
                            ) : (
                                <p className="py-[10px] text-center text-[13px] text-black-363636/50">
                                    Belum ada notifikasi platform 
                                </p>
                            )}
                        </div>

                        {channels.length > 0 ? (
                            <>
                                {/* Channel Section */}
                                <div className="mt-[10px] bg-white-FFFFFF px-[17px] pb-[12px] pt-[15px]">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[15px] font-bold text-black-363636">Channel</p>
                                        {channelUnreadIds.length > 0 ? (
                                            <button onClick={handleMarkAllChannelRead} className="flex items-center">
                                                <CheckIcon className="h-[14px] w-[14px] text-black-363636/60" />
                                                <p className="ml-[4px] text-[12px] font-semibold text-black-363636/60">
                                                    Tandai semua dibaca
                                                </p>
                                            </button>
                                        ) : null}
                                    </div>
                                    <div className="mt-[12px] flex overflow-x-auto [scrollbar-width:none]">
                                        {channels.map((c) => {
                                            const isActive = c.channel == selectedChannel;
                                            const meta = CHANNEL_META[c.channel] ?? {
                                                label: c.channel,
                                                icon: BellIcon,
                                            };
                                            return (
                                                <button
                                                    key={c.channel}
                                                    onClick={() => setSelectedChannel(c.channel)}
                                                    className={`mr-[10px] flex shrink-0 items-center rounded-full px-[14px] py-[7px] ${
                                                        isActive
                                                            ? 'bg-orange-f08120 text-white-FFFFFF'
                                                            : 'bg-white-FFFFFF text-black-363636'
                                                    }`}
                                                    style={!isActive ? { border: '1px solid #DEDEDE' } : undefined}
                                                >
                                                    <p className="text-[12px] font-semibold">{meta.label}</p>
                                                    {c.total_unread > 0 ? (
                                                        <div className="ml-[8px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-D90000 px-[3px]">
                                                            <p className="text-[9px] font-bold text-white-FFFFFF">
                                                                {c.total_unread > 99 ? '99+' : c.total_unread}
                                                            </p>
                                                        </div>
                                                    ) : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* List Channel Notifications */}
                                <div className="mt-[10px] bg-white-FFFFFF px-[17px] pb-[8px] pt-[13px]">
                                    {activeChannel?.data?.length ? (
                                        activeChannel.data.map((notif) => {
                                            const meta = CHANNEL_META[activeChannel.channel] ?? {
                                                label: activeChannel.channel,
                                                icon: BellIcon,
                                            };
                                            return renderNotifCard(notif, meta.icon);
                                        })
                                    ) : (
                                        <p className="py-[10px] text-center text-[13px] text-black-363636/50">
                                            Belum ada notifikasi pada channel ini
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </>
                )}
            </div>

            <NavbarMob UpgradeRole={!!upgradeRoleData} />
        </div>
    );
}
