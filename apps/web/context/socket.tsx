"use client";

import type { Socket } from "@/utils/socket";
import { connect } from "@/utils/socket";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

type Context = {
	socket: Socket | null;
	ready: boolean;
};

const SocketContext = createContext<Context>({
	socket: null,
	ready: false,
});

export const useSocket = () => {
	const ctx = useContext(SocketContext);
	return ctx;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
	const [socket, loadSocket] = useState<Socket | null>(null);
	const loading = useRef(false);
	const [ready, setReady] = useState(false);

	const load = useCallback(() => {
		connect().then((s) => {
			loadSocket(s);
			setReady(true);
		});
	}, []);

	// Initialize the socket
	useEffect(() => {
		if (!socket && !loading.current) {
			loading.current = true;
			load();
		}
	}, [socket, load]);

	// In case the socket disconnects, just drop it.
	useEffect(() => {
		if (!socket) return;

		socket.on("disconnect", () => loadSocket(null));

		return () => {
			socket.disconnect();
		};
	}, [socket]);

	return (
		<SocketContext.Provider
			value={useMemo(() => ({ ready, socket }), [socket, ready])}
		>
			{children}
		</SocketContext.Provider>
	);
};
